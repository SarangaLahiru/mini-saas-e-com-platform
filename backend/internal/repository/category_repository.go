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


