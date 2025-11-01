package repository

import (
	"context"

	"electronics-store/internal/domain/models"
	"gorm.io/gorm"
)

type CategoryListItem struct {
	ID            uint   `json:"id"`
	Name          string `json:"name"`
	Slug          string `json:"slug"`
	Image         string `json:"image"`
	ProductsCount int64  `json:"products_count"`
}

type CategoryRepository interface {
	ListWithCounts(ctx context.Context, limit int) ([]CategoryListItem, error)
	GetBySlug(ctx context.Context, slug string) (*models.Category, error)
	GetByID(ctx context.Context, id uint) (*models.Category, error)
	GetByResourceID(ctx context.Context, resourceID string) (*models.Category, error)
	List(ctx context.Context, limit, offset int) ([]*models.Category, error)
	Create(ctx context.Context, category *models.Category) error
	Update(ctx context.Context, category *models.Category) error
	Delete(ctx context.Context, id uint) error
	Count(ctx context.Context) (int64, error)
}

type categoryRepository struct {
	db *gorm.DB
}

func NewCategoryRepository(db *gorm.DB) CategoryRepository {
	return &categoryRepository{db: db}
}

func (r *categoryRepository) ListWithCounts(ctx context.Context, limit int) ([]CategoryListItem, error) {
	items := []CategoryListItem{}
	q := r.db.WithContext(ctx).
		Table("categories c").
		Select("c.id, c.name, c.slug, c.image, COALESCE(COUNT(p.id), 0) as products_count").
		Joins("LEFT JOIN product_categories pc ON pc.category_id = c.id").
		Joins("LEFT JOIN products p ON p.id = pc.product_id AND p.is_active = ?", true).
		Where("c.is_active = ?", true).
		Group("c.id").
		Order("c.sort_order ASC, c.name ASC")
	if limit > 0 {
		q = q.Limit(limit)
	}
	if err := q.Find(&items).Error; err != nil {
		return nil, err
	}
	return items, nil
}

func (r *categoryRepository) GetBySlug(ctx context.Context, slug string) (*models.Category, error) {
	var cat models.Category
	if err := r.db.WithContext(ctx).Where("slug = ?", slug).First(&cat).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &cat, nil
}

func (r *categoryRepository) GetByID(ctx context.Context, id uint) (*models.Category, error) {
	var cat models.Category
	if err := r.db.WithContext(ctx).First(&cat, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &cat, nil
}

func (r *categoryRepository) GetByResourceID(ctx context.Context, resourceID string) (*models.Category, error) {
	var cat models.Category
	if err := r.db.WithContext(ctx).Where("resource_id = ?", resourceID).First(&cat).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &cat, nil
}

func (r *categoryRepository) List(ctx context.Context, limit, offset int) ([]*models.Category, error) {
	var categories []*models.Category
	err := r.db.WithContext(ctx).
		Order("sort_order ASC, name ASC").
		Limit(limit).
		Offset(offset).
		Find(&categories).Error
	return categories, err
}

func (r *categoryRepository) Create(ctx context.Context, category *models.Category) error {
	return r.db.WithContext(ctx).Create(category).Error
}

func (r *categoryRepository) Update(ctx context.Context, category *models.Category) error {
	return r.db.WithContext(ctx).Save(category).Error
}

func (r *categoryRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&models.Category{}, id).Error
}

func (r *categoryRepository) Count(ctx context.Context) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&models.Category{}).Count(&count).Error
	return count, err
}


