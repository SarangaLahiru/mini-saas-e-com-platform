package usecase

import (
    "context"

    "electronics-store/internal/domain/models"
    "electronics-store/internal/dto"
    "electronics-store/internal/repository"
)

type CategoryUsecase interface {
    ListForHome(ctx context.Context, limit int) ([]dto.CategoryListItem, error)
    GetBySlug(ctx context.Context, slug string, page, limit int) ([]*models.Product, int64, error)
}

type categoryUsecase struct {
    catRepo repository.CategoryRepository
    prodUC  ProductUsecase
}

func NewCategoryUsecase(catRepo repository.CategoryRepository, prodUC ProductUsecase) CategoryUsecase {
    return &categoryUsecase{catRepo: catRepo, prodUC: prodUC}
}

func (u *categoryUsecase) ListForHome(ctx context.Context, limit int) ([]dto.CategoryListItem, error) {
    items, err := u.catRepo.ListWithCounts(ctx, limit)
    if err != nil {
        return nil, err
    }
    // map repo items to dto items (same fields)
    out := make([]dto.CategoryListItem, 0, len(items))
    for _, it := range items {
        out = append(out, dto.CategoryListItem{
            ID:            it.ID,
            Name:          it.Name,
            Slug:          it.Slug,
            Image:         it.Image,
            ProductsCount: it.ProductsCount,
        })
    }
    return out, nil
}

func (u *categoryUsecase) GetBySlug(ctx context.Context, slug string, page, limit int) ([]*models.Product, int64, error) {
    cat, err := u.catRepo.GetBySlug(ctx, slug)
    if err != nil || cat == nil {
        return nil, 0, err
    }
    products, total, err := u.prodUC.List(ctx, page, limit, map[string]interface{}{"category_id": cat.ID})
    if err != nil {
        return nil, 0, err
    }
    return products, total, nil
}


