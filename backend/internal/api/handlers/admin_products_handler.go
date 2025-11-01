package handlers

import (
	"net/http"

	"electronics-store/internal/dto"
	"electronics-store/internal/domain/models"
	"electronics-store/internal/repository"
	"electronics-store/internal/usecase"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AdminProductsHandler struct {
	productUsecase usecase.ProductUsecase
	productRepo    repository.ProductRepository
	categoryRepo   repository.CategoryRepository
}

func NewAdminProductsHandler(
	productUsecase usecase.ProductUsecase,
	productRepo repository.ProductRepository,
	categoryRepo repository.CategoryRepository,
) *AdminProductsHandler {
	return &AdminProductsHandler{
		productUsecase: productUsecase,
		productRepo:    productRepo,
		categoryRepo:   categoryRepo,
	}
}

// ListProducts godoc
// @Summary List all products (Admin)
// @Description Get a list of all products with admin-specific filters
// @Tags admin
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Param search query string false "Search query"
// @Param status query string false "Status filter"
// @Param category_id query int false "Category ID"
// @Success 200 {object} dto.AdminProductListResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /admin/products [get]
func (h *AdminProductsHandler) ListProducts(c *gin.Context) {
	var req dto.AdminProductListRequest
	if err := c.ShouldBindQuery(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: err.Error(),
		})
		return
	}

	// Set defaults
	if req.Page <= 0 {
		req.Page = 1
	}
	if req.Limit <= 0 {
		req.Limit = 20
	}
	if req.Limit > 100 {
		req.Limit = 100
	}

	// Convert to filters map
	filters := make(map[string]interface{})
	if req.Search != "" {
		filters["search"] = req.Search
	}
	if req.Status != "" {
		filters["status"] = req.Status
	}
	if req.Category > 0 {
		filters["category_id"] = req.Category
	}
	if req.SortBy != "" {
		filters["sort_by"] = req.SortBy
	}
	if req.SortOrder != "" {
		filters["sort_order"] = req.SortOrder
	}

	// Get products
	products, total, err := h.productUsecase.List(c.Request.Context(), req.Page, req.Limit, filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to get products",
			Message: err.Error(),
		})
		return
	}

	// Convert to response DTOs
	var productResponses []dto.ProductResponse
	for _, product := range products {
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

		// Determine status
		status := "active"
		if !product.IsFeatured && product.Stock == 0 {
			status = "inactive"
		}

		productResponses = append(productResponses, dto.ProductResponse{
			ID:           product.ID,
			ResourceID:   product.ResourceID,
			Name:         product.Name,
			Description:  product.Description,
			SKU:          product.SKU,
			Price:        product.Price,
			ComparePrice: product.ComparePrice,
			Cost:         product.Cost,
			Stock:        product.Stock,
			MinStock:     product.MinStock,
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

	c.JSON(http.StatusOK, dto.AdminProductListResponse{
		Products: productResponses,
		Total:    total,
		Page:     req.Page,
		Limit:    req.Limit,
	})
}

// CreateProduct godoc
// @Summary Create a new product
// @Description Create a new product (Admin only)
// @Tags admin
// @Accept json
// @Produce json
// @Param request body dto.CreateProductRequest true "Product data"
// @Success 201 {object} dto.ProductResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /admin/products [post]
func (h *AdminProductsHandler) CreateProduct(c *gin.Context) {
	var req dto.CreateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: err.Error(),
		})
		return
	}

	ctx := c.Request.Context()

	// Check if SKU already exists
	existing, err := h.productRepo.GetBySKU(ctx, req.SKU)
	if err != nil && err != gorm.ErrRecordNotFound {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to check SKU",
			Message: err.Error(),
		})
		return
	}
	if existing != nil {
		c.JSON(http.StatusConflict, dto.ErrorResponse{
			Error:   "SKU already exists",
			Message: "A product with this SKU already exists",
		})
		return
	}

	// Verify category exists
	category, err := h.categoryRepo.GetByID(ctx, req.CategoryID)
	if err != nil || category == nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid category",
			Message: "Category does not exist",
		})
		return
	}

	// Create product model
	product := &models.Product{
		ResourceID:   uuid.New().String(),
		Name:         req.Name,
		Description:  req.Description,
		SKU:          req.SKU,
		Price:        req.Price,
		ComparePrice: req.ComparePrice,
		Cost:         req.Cost,
		Stock:        req.Stock,
		MinStock:     req.MinStock,
		Weight:       req.Weight,
		Dimensions:   req.Dimensions,
		Brand:        req.Brand,
		Model:        req.Model,
		IsFeatured:   req.IsFeatured,
		IsDigital:    req.IsDigital,
	}

	// Set active status based on Status field
	if req.Status == "active" {
		product.IsFeatured = true
	}

	// Create product
	if err := h.productRepo.Create(ctx, product); err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to create product",
			Message: err.Error(),
		})
		return
	}

	// Associate with category using GORM many-to-many
	// We'll handle this by loading the product with categories and using GORM associations
	if err := h.productRepo.Update(ctx, product); err == nil {
		// Reload product to get associations working
		product, _ = h.productRepo.GetByID(ctx, product.ID)
		if product != nil {
			// Associate category using GORM
			var cat models.Category
			cat.ID = category.ID
			product.Categories = []models.Category{cat}
			h.productRepo.Update(ctx, product)
		}
	}

	// Fetch created product with relationships
	createdProduct, err := h.productRepo.GetByID(ctx, product.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to fetch created product",
			Message: err.Error(),
		})
		return
	}

	// Convert to response
	var images []dto.ImageResponse
	for _, img := range createdProduct.Images {
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

	var categoryResp dto.CategoryResponse
	if len(createdProduct.Categories) > 0 {
		c := createdProduct.Categories[0]
		categoryResp = dto.CategoryResponse{
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
	if !createdProduct.IsFeatured {
		status = "inactive"
	}

	c.JSON(http.StatusCreated, dto.ProductResponse{
		ID:           createdProduct.ID,
		ResourceID:   createdProduct.ResourceID,
		Name:         createdProduct.Name,
		Description:  createdProduct.Description,
		SKU:          createdProduct.SKU,
		Price:        createdProduct.Price,
		ComparePrice: createdProduct.ComparePrice,
		Cost:         createdProduct.Cost,
		Stock:        createdProduct.Stock,
		MinStock:     createdProduct.MinStock,
		Weight:       createdProduct.Weight,
		Dimensions:   createdProduct.Dimensions,
		Brand:        createdProduct.Brand,
		Model:        createdProduct.Model,
		Status:       status,
		IsFeatured:   createdProduct.IsFeatured,
		IsDigital:    createdProduct.IsDigital,
		CategoryID:   req.CategoryID,
		Category:     categoryResp,
		Images:       images,
		CreatedAt:    createdProduct.CreatedAt,
		UpdatedAt:    createdProduct.UpdatedAt,
	})
}

// UpdateProduct godoc
// @Summary Update a product
// @Description Update an existing product (Admin only)
// @Tags admin
// @Accept json
// @Produce json
// @Param id path string true "Product Resource ID"
// @Param request body dto.UpdateProductRequest true "Product data"
// @Success 200 {object} dto.ProductResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /admin/products/{id} [put]
func (h *AdminProductsHandler) UpdateProduct(c *gin.Context) {
	resourceID := c.Param("id")
	if resourceID == "" {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: "Product ID is required",
		})
		return
	}

	var req dto.UpdateProductRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: err.Error(),
		})
		return
	}

	ctx := c.Request.Context()

	// Get existing product
	product, err := h.productRepo.GetByResourceID(ctx, resourceID)
	if err != nil || product == nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{
			Error:   "Product not found",
			Message: "Product with the given ID does not exist",
		})
		return
	}

	// Update fields
	if req.Name != nil {
		product.Name = *req.Name
	}
	if req.Description != nil {
		product.Description = *req.Description
	}
	if req.SKU != nil {
		// Check if SKU is already taken by another product
		existing, err := h.productRepo.GetBySKU(ctx, *req.SKU)
		if err != nil && err != gorm.ErrRecordNotFound {
			c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Error:   "Failed to check SKU",
				Message: err.Error(),
			})
			return
		}
		if existing != nil && existing.ID != product.ID {
			c.JSON(http.StatusConflict, dto.ErrorResponse{
				Error:   "SKU already exists",
				Message: "Another product with this SKU already exists",
			})
			return
		}
		product.SKU = *req.SKU
	}
	if req.Price != nil {
		product.Price = *req.Price
	}
	if req.ComparePrice != nil {
		product.ComparePrice = *req.ComparePrice
	}
	if req.Cost != nil {
		product.Cost = *req.Cost
	}
	if req.Stock != nil {
		product.Stock = *req.Stock
	}
	if req.MinStock != nil {
		product.MinStock = *req.MinStock
	}
	if req.Weight != nil {
		product.Weight = *req.Weight
	}
	if req.Dimensions != nil {
		product.Dimensions = *req.Dimensions
	}
	if req.Brand != nil {
		product.Brand = *req.Brand
	}
	if req.Model != nil {
		product.Model = *req.Model
	}
	if req.Status != nil {
		// Map status to is_featured
		if *req.Status == "active" {
			product.IsFeatured = true
		} else {
			product.IsFeatured = false
		}
	}
	if req.IsFeatured != nil {
		product.IsFeatured = *req.IsFeatured
	}
	if req.IsDigital != nil {
		product.IsDigital = *req.IsDigital
	}
	if req.CategoryID != nil {
		// Verify category exists
		category, err := h.categoryRepo.GetByID(ctx, *req.CategoryID)
		if err != nil || category == nil {
			c.JSON(http.StatusBadRequest, dto.ErrorResponse{
				Error:   "Invalid category",
				Message: "Category does not exist",
			})
			return
		}
		product.CategoryID = *req.CategoryID
		// Update category association
		// Note: You might need to implement ReplaceCategories method
	}

	// Update product
	if err := h.productRepo.Update(ctx, product); err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to update product",
			Message: err.Error(),
		})
		return
	}

	// Fetch updated product
	updatedProduct, err := h.productRepo.GetByResourceID(ctx, resourceID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to fetch updated product",
			Message: err.Error(),
		})
		return
	}

	// Convert to response
	var images []dto.ImageResponse
	for _, img := range updatedProduct.Images {
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

	var categoryResp dto.CategoryResponse
	if len(updatedProduct.Categories) > 0 {
		c := updatedProduct.Categories[0]
		categoryResp = dto.CategoryResponse{
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
	if !updatedProduct.IsFeatured {
		status = "inactive"
	}

	c.JSON(http.StatusOK, dto.ProductResponse{
		ID:           updatedProduct.ID,
		ResourceID:   updatedProduct.ResourceID,
		Name:         updatedProduct.Name,
		Description:  updatedProduct.Description,
		SKU:          updatedProduct.SKU,
		Price:        updatedProduct.Price,
		ComparePrice: updatedProduct.ComparePrice,
		Cost:         updatedProduct.Cost,
		Stock:        updatedProduct.Stock,
		MinStock:     updatedProduct.MinStock,
		Weight:       updatedProduct.Weight,
		Dimensions:   updatedProduct.Dimensions,
		Brand:        updatedProduct.Brand,
		Model:        updatedProduct.Model,
		Status:       status,
		IsFeatured:   updatedProduct.IsFeatured,
		IsDigital:    updatedProduct.IsDigital,
		CategoryID:   updatedProduct.CategoryID,
		Category:     categoryResp,
		Images:       images,
		CreatedAt:    updatedProduct.CreatedAt,
		UpdatedAt:    updatedProduct.UpdatedAt,
	})
}

// DeleteProduct godoc
// @Summary Delete a product
// @Description Delete a product (Admin only) - Soft delete
// @Tags admin
// @Accept json
// @Produce json
// @Param id path string true "Product Resource ID"
// @Success 200 {object} dto.SuccessResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /admin/products/{id} [delete]
func (h *AdminProductsHandler) DeleteProduct(c *gin.Context) {
	resourceID := c.Param("id")
	if resourceID == "" {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: "Product ID is required",
		})
		return
	}

	ctx := c.Request.Context()

	// Get product to find its ID
	product, err := h.productRepo.GetByResourceID(ctx, resourceID)
	if err != nil || product == nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{
			Error:   "Product not found",
			Message: "Product with the given ID does not exist",
		})
		return
	}

	// Delete product (soft delete via GORM)
	if err := h.productRepo.Delete(ctx, product.ID); err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to delete product",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Message: "Product deleted successfully",
	})
}

