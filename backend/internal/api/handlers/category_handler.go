package handlers

import (
    "net/http"
    "strconv"

    "electronics-store/internal/dto"
    "electronics-store/internal/usecase"
    "github.com/gin-gonic/gin"
)

type CategoryHandler struct {
    categoryUsecase usecase.CategoryUsecase
    productUsecase  usecase.ProductUsecase
}

func NewCategoryHandler(categoryUsecase usecase.CategoryUsecase, productUsecase usecase.ProductUsecase) *CategoryHandler {
    return &CategoryHandler{categoryUsecase: categoryUsecase, productUsecase: productUsecase}
}

// List categories for home with counts
// GET /categories
func (h *CategoryHandler) List(c *gin.Context) {
    // Optional limit for home grid; default 10
    limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
    items, err := h.categoryUsecase.ListForHome(c.Request.Context(), limit)
    if err != nil {
        c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Failed to load categories", Message: err.Error()})
        return
    }
    c.JSON(http.StatusOK, dto.CategoryListResponse{Categories: items})
}

// Get category by slug with paginated products
// GET /categories/:slug
func (h *CategoryHandler) GetBySlug(c *gin.Context) {
    slug := c.Param("slug")
    if slug == "" {
        c.JSON(http.StatusBadRequest, dto.ErrorResponse{Error: "Invalid request", Message: "Slug is required"})
        return
    }
    page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
    limit, _ := strconv.Atoi(c.DefaultQuery("limit", "12"))

    products, total, err := h.categoryUsecase.GetBySlug(c.Request.Context(), slug, page, limit)
    if err != nil {
        c.JSON(http.StatusInternalServerError, dto.ErrorResponse{Error: "Failed to load category", Message: err.Error()})
        return
    }
    if total == 0 {
        c.JSON(http.StatusOK, dto.CategoryPageResponse{Products: []dto.ProductResponse{}, Pagination: dto.Pagination{Page: page, Limit: limit, Total: 0, TotalPages: 0}})
        return
    }

    // Map products to DTOs (reuse mapping similar to product handler)
    out := make([]dto.ProductResponse, 0, len(products))
    for _, p := range products {
        var images []dto.ImageResponse
        for _, img := range p.Images {
            images = append(images, dto.ImageResponse{
                ResourceID: img.ResourceID,
                ProductID:  img.ProductID,
                URL:        img.URL,
                Alt:        img.Alt,
                SortOrder:  img.SortOrder,
                IsPrimary:  img.IsPrimary,
                CreatedAt:  img.CreatedAt,
            })
        }
        var category dto.CategoryResponse
        if p.Category.ResourceID != "" {
            category = dto.CategoryResponse{
                ResourceID:  p.Category.ResourceID,
                Name:        p.Category.Name,
                Slug:        p.Category.Slug,
                Description: p.Category.Description,
                Image:       p.Category.Image,
                ParentID:    p.Category.ParentID,
                SortOrder:   p.Category.SortOrder,
                IsActive:    p.Category.IsActive,
                CreatedAt:   p.Category.CreatedAt,
                UpdatedAt:   p.Category.UpdatedAt,
            }
        }
        out = append(out, dto.ProductResponse{
            ID:           p.ID,
            ResourceID:   p.ResourceID,
            Name:         p.Name,
            Description:  p.Description,
            SKU:          p.SKU,
            Price:        p.Price,
            ComparePrice: p.ComparePrice,
            Cost:         p.Cost,
            Stock:        p.Stock,
            MinStock:     p.MinStock,
            Weight:       p.Weight,
            Dimensions:   p.Dimensions,
            Brand:        p.Brand,
            Model:        p.Model,
            Status:       p.Status,
            IsFeatured:   p.IsFeatured,
            IsDigital:    p.IsDigital,
            CategoryID:   p.CategoryID,
            Category:     category,
            Images:       images,
            CreatedAt:    p.CreatedAt,
            UpdatedAt:    p.UpdatedAt,
        })
    }

    totalPages := (int(total) + limit - 1) / limit
    c.JSON(http.StatusOK, dto.CategoryPageResponse{
        Products: out,
        Pagination: dto.Pagination{
            Page:       page,
            Limit:      limit,
            Total:      total,
            TotalPages: totalPages,
        },
    })
}


