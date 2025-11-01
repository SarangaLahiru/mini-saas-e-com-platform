package handlers

import (
	"net/http"

	"electronics-store/internal/dto"

	"github.com/gin-gonic/gin"
)

// GetProduct godoc
// @Summary Get a product by ID (Admin)
// @Description Get product details by resource ID (Admin only)
// @Tags admin
// @Accept json
// @Produce json
// @Param id path string true "Product Resource ID"
// @Success 200 {object} dto.ProductResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /admin/products/{id} [get]
func (h *AdminProductsHandler) GetProduct(c *gin.Context) {
	resourceID := c.Param("id")
	if resourceID == "" {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: "Product ID is required",
		})
		return
	}

	ctx := c.Request.Context()

	// Get product
	product, err := h.productUsecase.GetByResourceID(ctx, resourceID)
	if err != nil || product == nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{
			Error:   "Product not found",
			Message: "Product with the given ID does not exist",
		})
		return
	}

	// Convert to response
	var images []dto.ImageResponse
	for _, img := range product.Images {
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
	if len(product.Categories) > 0 {
		c := product.Categories[0]
		category = dto.CategoryResponse{
			ResourceID:  c.ResourceID,
			Name:        c.Name,
			Slug:        c.Slug,
			Description: c.Description,
			Image:       c.Image,
			ParentID:    c.ParentID,
			SortOrder:   c.SortOrder,
			IsActive:    c.IsActive,
			CreatedAt:   c.CreatedAt,
			UpdatedAt:   c.UpdatedAt,
		}
	}

	status := "active"
	if !product.IsFeatured {
		status = "inactive"
	}

	c.JSON(http.StatusOK, dto.ProductResponse{
		ID:           product.ID,
		ResourceID:   product.ResourceID,
		Name:         product.Name,
		Description:  product.Description,
		SKU:          product.SKU,
		Price:        product.Price,
		ComparePrice: product.ComparePrice,
		Cost:         product.CostPrice,
		Stock:        product.StockQuantity,
		MinStock:     product.LowStockThreshold,
		Weight:       product.Weight,
		Dimensions:   product.Dimensions,
		Brand:        product.Brand,
		Model:        product.Model,
		Status:       status,
		IsFeatured:   product.IsFeatured,
		IsDigital:    product.IsDigital,
		CategoryID:   product.CategoryID,
		Category:     category,
		Images:       images,
		CreatedAt:    product.CreatedAt,
		UpdatedAt:    product.UpdatedAt,
	})
}

