package repository

import (
	"context"
	"errors"

	"electronics-store/internal/domain/models"
	"gorm.io/gorm"
)

type OrderRepository interface {
	Create(ctx context.Context, order *models.Order) error
	GetByID(ctx context.Context, id uint) (*models.Order, error)
	GetByResourceID(ctx context.Context, resourceID string) (*models.Order, error)
	GetByOrderNumber(ctx context.Context, orderNumber string) (*models.Order, error)
	Update(ctx context.Context, order *models.Order) error
	Delete(ctx context.Context, id uint) error
	List(ctx context.Context, userID uint, limit, offset int, filters map[string]interface{}) ([]*models.Order, error)
	Count(ctx context.Context, userID uint, filters map[string]interface{}) (int64, error)
}

type orderRepository struct {
	db *gorm.DB
}

func NewOrderRepository(db *gorm.DB) OrderRepository {
	return &orderRepository{db: db}
}

func (r *orderRepository) Create(ctx context.Context, order *models.Order) error {
	return r.db.WithContext(ctx).Create(order).Error
}

func (r *orderRepository) GetByID(ctx context.Context, id uint) (*models.Order, error) {
	var order models.Order
	err := r.db.WithContext(ctx).
		Preload("User").
		Preload("OrderItems").
		Preload("OrderItems.Product").
		Preload("OrderItems.Variant").
		Preload("Payments", func(db *gorm.DB) *gorm.DB {
			// Explicitly select all payment fields including payment_status
			return db.Select("id", "resource_id", "order_id", "payment_method", "amount", "currency", "payment_status", "transaction_id", "gateway_response", "processed_at", "created_at", "updated_at")
		}).
		First(&order, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &order, nil
}

func (r *orderRepository) GetByResourceID(ctx context.Context, resourceID string) (*models.Order, error) {
	var order models.Order
	err := r.db.WithContext(ctx).
		Preload("User").
		Preload("OrderItems").
		Preload("OrderItems.Product").
		Preload("OrderItems.Product.Images").
		Preload("OrderItems.Variant").
		Preload("Payments", func(db *gorm.DB) *gorm.DB {
			// Explicitly select all payment fields including payment_status
			return db.Select("id", "resource_id", "order_id", "payment_method", "amount", "currency", "payment_status", "transaction_id", "gateway_response", "processed_at", "created_at", "updated_at")
		}).
		Where("resource_id = ?", resourceID).
		First(&order).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &order, nil
}

func (r *orderRepository) GetByOrderNumber(ctx context.Context, orderNumber string) (*models.Order, error) {
	var order models.Order
	err := r.db.WithContext(ctx).
		Preload("User").
		Preload("OrderItems").
		Preload("OrderItems.Product").
		Preload("OrderItems.Variant").
		Preload("Payments", func(db *gorm.DB) *gorm.DB {
			// Explicitly select all payment fields including payment_status
			return db.Select("id", "resource_id", "order_id", "payment_method", "amount", "currency", "payment_status", "transaction_id", "gateway_response", "processed_at", "created_at", "updated_at")
		}).
		Where("order_number = ?", orderNumber).
		First(&order).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &order, nil
}

func (r *orderRepository) Update(ctx context.Context, order *models.Order) error {
	return r.db.WithContext(ctx).Save(order).Error
}

func (r *orderRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&models.Order{}, id).Error
}

func (r *orderRepository) List(ctx context.Context, userID uint, limit, offset int, filters map[string]interface{}) ([]*models.Order, error) {
	var orders []*models.Order
	query := r.db.WithContext(ctx).
		Preload("User").
		Preload("OrderItems").
		Preload("OrderItems.Product").
		Preload("OrderItems.Variant").
		Preload("Payments", func(db *gorm.DB) *gorm.DB {
			// Explicitly select all payment fields including payment_status
			return db.Select("id", "resource_id", "order_id", "payment_method", "amount", "currency", "payment_status", "transaction_id", "gateway_response", "processed_at", "created_at", "updated_at")
		})

	if userID > 0 {
		query = query.Where("user_id = ?", userID)
	}

	// Apply filters
	if status, ok := filters["status"].(string); ok && status != "" {
		query = query.Where("status = ?", status)
	}
	if paymentStatus, ok := filters["payment_status"].(string); ok && paymentStatus != "" {
		query = query.Where("payment_status = ?", paymentStatus)
	}
	if dateFrom, ok := filters["date_from"].(string); ok && dateFrom != "" {
		query = query.Where("DATE(created_at) >= ?", dateFrom)
	}
	if dateTo, ok := filters["date_to"].(string); ok && dateTo != "" {
		query = query.Where("DATE(created_at) <= ?", dateTo)
	}

	err := query.Order("created_at desc").
		Limit(limit).
		Offset(offset).
		Find(&orders).Error
	return orders, err
}

func (r *orderRepository) Count(ctx context.Context, userID uint, filters map[string]interface{}) (int64, error) {
	var count int64
	query := r.db.WithContext(ctx).Model(&models.Order{})

	if userID > 0 {
		query = query.Where("user_id = ?", userID)
	}

	// Apply same filters as List
	if status, ok := filters["status"].(string); ok && status != "" {
		query = query.Where("status = ?", status)
	}
	if paymentStatus, ok := filters["payment_status"].(string); ok && paymentStatus != "" {
		query = query.Where("payment_status = ?", paymentStatus)
	}
	if dateFrom, ok := filters["date_from"].(string); ok && dateFrom != "" {
		query = query.Where("DATE(created_at) >= ?", dateFrom)
	}
	if dateTo, ok := filters["date_to"].(string); ok && dateTo != "" {
		query = query.Where("DATE(created_at) <= ?", dateTo)
	}

	err := query.Count(&count).Error
	return count, err
}