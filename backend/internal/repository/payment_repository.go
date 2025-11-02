package repository

import (
	"context"
	"errors"

	"electronics-store/internal/domain/models"
	"gorm.io/gorm"
)

type PaymentRepository interface {
	Create(ctx context.Context, payment *models.Payment) error
	GetByID(ctx context.Context, id uint) (*models.Payment, error)
	GetByResourceID(ctx context.Context, resourceID string) (*models.Payment, error)
	GetByOrderID(ctx context.Context, orderID uint) ([]*models.Payment, error)
	Update(ctx context.Context, payment *models.Payment) error
}

type paymentRepository struct {
	db *gorm.DB
}

func NewPaymentRepository(db *gorm.DB) PaymentRepository {
	return &paymentRepository{db: db}
}

func (r *paymentRepository) Create(ctx context.Context, payment *models.Payment) error {
	if err := r.db.WithContext(ctx).Create(payment).Error; err != nil {
		return err
	}
	// Verify payment was created by reloading it
	var createdPayment models.Payment
	if err := r.db.WithContext(ctx).Where("id = ?", payment.ID).First(&createdPayment).Error; err != nil {
		return err
	}
	// Copy the resource_id back to the payment object if it was auto-generated
	if payment.ResourceID == "" && createdPayment.ResourceID != "" {
		payment.ResourceID = createdPayment.ResourceID
	}
	return nil
}

func (r *paymentRepository) GetByID(ctx context.Context, id uint) (*models.Payment, error) {
	var payment models.Payment
	err := r.db.WithContext(ctx).First(&payment, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &payment, nil
}

func (r *paymentRepository) GetByResourceID(ctx context.Context, resourceID string) (*models.Payment, error) {
	var payment models.Payment
	err := r.db.WithContext(ctx).Where("resource_id = ?", resourceID).First(&payment).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &payment, nil
}

func (r *paymentRepository) GetByOrderID(ctx context.Context, orderID uint) ([]*models.Payment, error) {
	var payments []*models.Payment
	err := r.db.WithContext(ctx).Where("order_id = ?", orderID).Find(&payments).Error
	return payments, err
}

func (r *paymentRepository) Update(ctx context.Context, payment *models.Payment) error {
	return r.db.WithContext(ctx).Save(payment).Error
}

