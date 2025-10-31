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
	List(ctx context.Context, userID uint, limit, offset int) ([]*models.Order, error)
	Count(ctx context.Context, userID uint) (int64, error)
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
		Preload("Payments").
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
		Preload("OrderItems.Variant").
		Preload("Payments").
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
		Preload("Payments").
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

func (r *orderRepository) List(ctx context.Context, userID uint, limit, offset int) ([]*models.Order, error) {
	var orders []*models.Order
	query := r.db.WithContext(ctx).
		Preload("User").
		Preload("OrderItems").
		Preload("OrderItems.Product").
		Preload("OrderItems.Variant").
		Preload("Payments")

	if userID > 0 {
		query = query.Where("user_id = ?", userID)
	}

	err := query.Order("created_at desc").
		Limit(limit).
		Offset(offset).
		Find(&orders).Error
	return orders, err
}

func (r *orderRepository) Count(ctx context.Context, userID uint) (int64, error) {
	var count int64
	query := r.db.WithContext(ctx).Model(&models.Order{})

	if userID > 0 {
		query = query.Where("user_id = ?", userID)
	}

	err := query.Count(&count).Error
	return count, err
}