package usecase

import (
	"context"
	"errors"

	"electronics-store/internal/domain/models"
	"electronics-store/internal/repository"
)

var (
	ErrProductNotFound = errors.New("product not found")
)

type ProductUsecase interface {
	List(ctx context.Context, page, limit int, filters map[string]interface{}) ([]*models.Product, int64, error)
	GetByID(ctx context.Context, id uint) (*models.Product, error)
	GetByResourceID(ctx context.Context, resourceID string) (*models.Product, error)
	Search(ctx context.Context, query string, page, limit int) ([]*models.Product, int64, error)
	GetFeatured(ctx context.Context, limit int) ([]*models.Product, error)
	GetByCategory(ctx context.Context, categoryID uint, page, limit int) ([]*models.Product, error)
    ListBrands(ctx context.Context) ([]models.Brand, error)
    Suggest(ctx context.Context, q string, limit int) ([]*models.Product, error)
}

type productUsecase struct {
	productRepo repository.ProductRepository
}

func NewProductUsecase(productRepo repository.ProductRepository) ProductUsecase {
	return &productUsecase{
		productRepo: productRepo,
	}
}

func (u *productUsecase) List(ctx context.Context, page, limit int, filters map[string]interface{}) ([]*models.Product, int64, error) {
	offset := (page - 1) * limit
	
	products, err := u.productRepo.List(ctx, limit, offset, filters)
	if err != nil {
		return nil, 0, err
	}

	total, err := u.productRepo.Count(ctx, filters)
	if err != nil {
		return nil, 0, err
	}

	return products, total, nil
}

func (u *productUsecase) GetByID(ctx context.Context, id uint) (*models.Product, error) {
	product, err := u.productRepo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if product == nil {
		return nil, ErrProductNotFound
	}
	return product, nil
}

func (u *productUsecase) GetByResourceID(ctx context.Context, resourceID string) (*models.Product, error) {
	product, err := u.productRepo.GetByResourceID(ctx, resourceID)
	if err != nil {
		return nil, err
	}
	if product == nil {
		return nil, ErrProductNotFound
	}
	return product, nil
}

func (u *productUsecase) ListBrands(ctx context.Context) ([]models.Brand, error) {
    return u.productRepo.ListBrands(ctx)
}

func (u *productUsecase) Suggest(ctx context.Context, q string, limit int) ([]*models.Product, error) {
    if limit <= 0 || limit > 10 { // keep small for autocomplete
        limit = 8
    }
    return u.productRepo.Suggest(ctx, q, limit)
}

func (u *productUsecase) Search(ctx context.Context, query string, page, limit int) ([]*models.Product, int64, error) {
	offset := (page - 1) * limit
	
	products, err := u.productRepo.Search(ctx, query, limit, offset)
	if err != nil {
		return nil, 0, err
	}

	// For search, we'll use a simple count for now
	// In a real implementation, you might want a separate search count method
	total := int64(len(products))
	
	return products, total, nil
}

func (u *productUsecase) GetFeatured(ctx context.Context, limit int) ([]*models.Product, error) {
	return u.productRepo.GetFeatured(ctx, limit)
}

func (u *productUsecase) GetByCategory(ctx context.Context, categoryID uint, page, limit int) ([]*models.Product, error) {
	offset := (page - 1) * limit
	return u.productRepo.GetByCategory(ctx, categoryID, limit, offset)
}
