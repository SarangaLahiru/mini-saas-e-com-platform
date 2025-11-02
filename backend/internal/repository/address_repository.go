package repository

import (
	"context"
	"errors"

	"electronics-store/internal/domain/models"
	"gorm.io/gorm"
)

type AddressRepository interface {
	Create(ctx context.Context, address *models.Address) error
	GetByID(ctx context.Context, id uint) (*models.Address, error)
	GetByResourceID(ctx context.Context, resourceID string) (*models.Address, error)
	GetByUserID(ctx context.Context, userID uint) ([]*models.Address, error)
	Update(ctx context.Context, address *models.Address) error
	Delete(ctx context.Context, id uint) error
	SetDefault(ctx context.Context, userID uint, addressID uint) error
}

type addressRepository struct {
	db *gorm.DB
}

func NewAddressRepository(db *gorm.DB) AddressRepository {
	return &addressRepository{db: db}
}

func (r *addressRepository) Create(ctx context.Context, address *models.Address) error {
	return r.db.WithContext(ctx).Create(address).Error
}

func (r *addressRepository) GetByID(ctx context.Context, id uint) (*models.Address, error) {
	var address models.Address
	err := r.db.WithContext(ctx).First(&address, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &address, nil
}

func (r *addressRepository) GetByResourceID(ctx context.Context, resourceID string) (*models.Address, error) {
	var address models.Address
	err := r.db.WithContext(ctx).Where("resource_id = ?", resourceID).First(&address).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &address, nil
}

func (r *addressRepository) GetByUserID(ctx context.Context, userID uint) ([]*models.Address, error) {
	var addresses []*models.Address
	err := r.db.WithContext(ctx).Where("user_id = ?", userID).Order("is_default DESC, created_at DESC").Find(&addresses).Error
	return addresses, err
}

func (r *addressRepository) Update(ctx context.Context, address *models.Address) error {
	return r.db.WithContext(ctx).Save(address).Error
}

func (r *addressRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&models.Address{}, id).Error
}

func (r *addressRepository) SetDefault(ctx context.Context, userID uint, addressID uint) error {
	// First, unset all default addresses for this user
	err := r.db.WithContext(ctx).Model(&models.Address{}).
		Where("user_id = ?", userID).
		Update("is_default", false).Error
	if err != nil {
		return err
	}

	// If addressID is 0, just unset all (no need to set a new default)
	if addressID == 0 {
		return nil
	}

	// Then set the specified address as default
	return r.db.WithContext(ctx).Model(&models.Address{}).
		Where("id = ? AND user_id = ?", addressID, userID).
		Update("is_default", true).Error
}

