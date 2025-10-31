package usecase

import (
	"context"
	"errors"

	"electronics-store/internal/domain/models"
	"electronics-store/internal/repository"
)

var (
	ErrOrderNotFound = errors.New("order not found")
)

type OrderUsecase interface {
	List(ctx context.Context, userID uint, page, limit int) ([]*models.Order, int64, error)
	GetByID(ctx context.Context, id uint) (*models.Order, error)
	GetByResourceID(ctx context.Context, resourceID string) (*models.Order, error)
	Create(ctx context.Context, order *models.Order) error
	Update(ctx context.Context, order *models.Order) error
	Delete(ctx context.Context, id uint) error
}

type orderUsecase struct {
	orderRepo repository.OrderRepository
}

func NewOrderUsecase(orderRepo repository.OrderRepository) OrderUsecase {
	return &orderUsecase{
		orderRepo: orderRepo,
	}
}

func (u *orderUsecase) List(ctx context.Context, userID uint, page, limit int) ([]*models.Order, int64, error) {
	offset := (page - 1) * limit
	
	orders, err := u.orderRepo.List(ctx, userID, limit, offset)
	if err != nil {
		return nil, 0, err
	}

	total, err := u.orderRepo.Count(ctx, userID)
	if err != nil {
		return nil, 0, err
	}

	return orders, total, nil
}

func (u *orderUsecase) GetByID(ctx context.Context, id uint) (*models.Order, error) {
	order, err := u.orderRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if order == nil {
		return nil, ErrOrderNotFound
	}
	return order, nil
}

func (u *orderUsecase) GetByResourceID(ctx context.Context, resourceID string) (*models.Order, error) {
	order, err := u.orderRepo.GetByResourceID(ctx, resourceID)
	if err != nil {
		return nil, err
	}
	if order == nil {
		return nil, ErrOrderNotFound
	}
	return order, nil
}

func (u *orderUsecase) Create(ctx context.Context, order *models.Order) error {
	return u.orderRepo.Create(ctx, order)
}

func (u *orderUsecase) Update(ctx context.Context, order *models.Order) error {
	return u.orderRepo.Update(ctx, order)
}

func (u *orderUsecase) Delete(ctx context.Context, id uint) error {
	return u.orderRepo.Delete(ctx, id)
}