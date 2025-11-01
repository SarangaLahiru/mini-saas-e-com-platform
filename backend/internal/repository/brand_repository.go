package repository

import (
	"context"

	"electronics-store/internal/domain/models"
	"gorm.io/gorm"
)

type BrandRepository interface {
	List(ctx context.Context) ([]*models.Brand, error)
	GetByID(ctx context.Context, id uint) (*models.Brand, error)
	GetBySlug(ctx context.Context, slug string) (*models.Brand, error)
	Create(ctx context.Context, brand *models.Brand) error
	Update(ctx context.Context, brand *models.Brand) error
	Delete(ctx context.Context, id uint) error
	Count(ctx context.Context) (int64, error)
}

type brandRepository struct {
	db *gorm.DB
}

func NewBrandRepository(db *gorm.DB) BrandRepository {
	return &brandRepository{db: db}
}

func (r *brandRepository) List(ctx context.Context) ([]*models.Brand, error) {
	var brands []*models.Brand
	err := r.db.WithContext(ctx).Order("name ASC").Find(&brands).Error
	return brands, err
}

func (r *brandRepository) GetByID(ctx context.Context, id uint) (*models.Brand, error) {
	var brand models.Brand
	err := r.db.WithContext(ctx).First(&brand, id).Error
	if err != nil {
		return nil, err
	}
	return &brand, nil
}

func (r *brandRepository) GetBySlug(ctx context.Context, slug string) (*models.Brand, error) {
	var brand models.Brand
	err := r.db.WithContext(ctx).Where("slug = ?", slug).First(&brand).Error
	if err != nil {
		return nil, err
	}
	return &brand, nil
}

func (r *brandRepository) Create(ctx context.Context, brand *models.Brand) error {
	return r.db.WithContext(ctx).Create(brand).Error
}

func (r *brandRepository) Update(ctx context.Context, brand *models.Brand) error {
	return r.db.WithContext(ctx).Save(brand).Error
}

func (r *brandRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&models.Brand{}, id).Error
}

func (r *brandRepository) Count(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&models.Brand{}).Count(&count).Error
	return count, err
}

