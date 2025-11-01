package handlers

import (
	"fmt"
	"net/http"
	"strings"
	"time"

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
	db            *gorm.DB
}

func NewAdminProductsHandler(
	productUsecase usecase.ProductUsecase,
	productRepo repository.ProductRepository,
	categoryRepo repository.CategoryRepository,
	db *gorm.DB,
) *AdminProductsHandler {
	return &AdminProductsHandler{
		productUsecase: productUsecase,
		productRepo:    productRepo,
		categoryRepo:   categoryRepo,
		db:            db,
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

		// Determine status based on is_active
		status := "active"
		if !product.IsActive {
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

	// Debug: Log request data
	gin.DefaultWriter.Write([]byte(fmt.Sprintf("[DEBUG] CreateProduct Request: Name=%s, SKU=%s, Price=%f, StockQuantity=%d, LowStockThreshold=%d, CategoryID=%d, BrandID=%v, IsActive=%v\n", 
		req.Name, req.SKU, req.Price, req.StockQuantity, req.LowStockThreshold, req.CategoryID, req.BrandID, req.IsActive)))
	
	// Debug: Log images received
	if len(req.Images) > 0 {
		gin.DefaultWriter.Write([]byte(fmt.Sprintf("[DEBUG] Received %d images for product creation\n", len(req.Images))))
		for i, img := range req.Images {
			gin.DefaultWriter.Write([]byte(fmt.Sprintf("[DEBUG] Image %d: URL=%s, Alt=%s, SortOrder=%d, IsPrimary=%v\n", i, img.URL, img.Alt, img.SortOrder, img.IsPrimary)))
		}
	} else {
		gin.DefaultWriter.Write([]byte("[DEBUG] No images received in request\n"))
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

	// Generate slug from name
	slug := strings.ToLower(strings.ReplaceAll(strings.TrimSpace(req.Name), " ", "-"))
	
	// Create product model
	product := &models.Product{
		ResourceID:        uuid.New().String(),
		Name:              req.Name,
		Slug:              slug,
		Description:       req.Description,
		ShortDescription:  req.ShortDescription,
		SKU:               req.SKU,
		BrandID:           req.BrandID,
		Price:             req.Price,
		ComparePrice:      req.ComparePrice,
		CostPrice:         req.CostPrice,
		StockQuantity:     req.StockQuantity,
		LowStockThreshold: req.LowStockThreshold,
		TrackQuantity:     req.TrackQuantity,
		AllowBackorder:    req.AllowBackorder,
		Weight:            req.Weight,
		Length:            req.Length,
		Width:             req.Width,
		Height:            req.Height,
		IsActive:          req.IsActive,
		IsFeatured:        req.IsFeatured,
		IsDigital:         req.IsDigital,
		RequiresShipping:  req.RequiresShipping,
		Taxable:           req.Taxable,
		MetaTitle:         req.MetaTitle,
		MetaDescription:   req.MetaDescription,
	}

	// Set computed fields for backward compatibility
	product.Stock = product.StockQuantity
	product.MinStock = product.LowStockThreshold

	// Debug: Log product before save
	gin.DefaultWriter.Write([]byte(fmt.Sprintf("[DEBUG] Product before save: StockQuantity=%d, LowStockThreshold=%d, CostPrice=%f, IsActive=%v\n", 
		product.StockQuantity, product.LowStockThreshold, product.CostPrice, product.IsActive)))

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

	// Save images if provided
	if len(req.Images) > 0 {
		gin.DefaultWriter.Write([]byte(fmt.Sprintf("[DEBUG] Processing %d images for product ID: %d\n", len(req.Images), product.ID)))
		
		// First, ensure only one primary image
		hasPrimary := false
		for i := range req.Images {
			if req.Images[i].IsPrimary {
				if hasPrimary {
					req.Images[i].IsPrimary = false
				}
				hasPrimary = true
			}
		}
		// If no primary, make first one primary
		if !hasPrimary && len(req.Images) > 0 {
			req.Images[0].IsPrimary = true
		}

		// Create image records
		savedCount := 0
		for idx, imgReq := range req.Images {
			// Skip if URL is empty
			if strings.TrimSpace(imgReq.URL) == "" {
				gin.DefaultWriter.Write([]byte(fmt.Sprintf("[WARN] Skipping image %d: empty URL\n", idx)))
				continue
			}
			
			// Prepare alt text - use provided alt or extract from URL
			altText := strings.TrimSpace(imgReq.Alt)
			if altText == "" {
				// Extract filename from URL as fallback
				if lastSlash := len(imgReq.URL); lastSlash > 0 {
					// Try to extract a meaningful name from URL
					parts := strings.Split(imgReq.URL, "/")
					if len(parts) > 0 {
						filename := parts[len(parts)-1]
						// Remove extension and use as alt
						if dotIdx := strings.LastIndex(filename, "."); dotIdx > 0 {
							filename = filename[:dotIdx]
						}
						altText = filename
					}
				}
				if altText == "" {
					altText = fmt.Sprintf("Product image %d", idx+1)
				}
			}
			
			image := &models.Image{
				ResourceID: uuid.New().String(),
				ProductID:  product.ID,
				URL:        strings.TrimSpace(imgReq.URL), // Trim whitespace
				Alt:        altText,
				SortOrder:  imgReq.SortOrder,
				IsPrimary:  imgReq.IsPrimary,
				CreatedAt:  time.Now(),
			}
			
			gin.DefaultWriter.Write([]byte(fmt.Sprintf("[DEBUG] Creating image record: ResourceID=%s, ProductID=%d, URL=%s, Alt=%s, SortOrder=%d, IsPrimary=%v\n", 
				image.ResourceID, image.ProductID, image.URL, image.Alt, image.SortOrder, image.IsPrimary)))
			
			if err := h.db.WithContext(ctx).Create(image).Error; err != nil {
				gin.DefaultWriter.Write([]byte(fmt.Sprintf("[ERROR] Failed to save image %d: %v\n", idx, err)))
				c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
					Error:   "Failed to save image",
					Message: fmt.Sprintf("Failed to save image %d: %v", idx, err),
				})
				return
			}
			savedCount++
			gin.DefaultWriter.Write([]byte(fmt.Sprintf("[DEBUG] Successfully saved image %d\n", idx)))
		}
		gin.DefaultWriter.Write([]byte(fmt.Sprintf("[DEBUG] Successfully saved %d/%d images\n", savedCount, len(req.Images))))
	} else {
		gin.DefaultWriter.Write([]byte("[DEBUG] No images to save\n"))
	}

	// Fetch created product with relationships (this will trigger AfterFind hook)
	createdProduct, err := h.productRepo.GetByID(ctx, product.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to fetch created product",
			Message: err.Error(),
		})
		return
	}
	
	// Debug: Verify saved data from database
	if createdProduct != nil {
		gin.DefaultWriter.Write([]byte(fmt.Sprintf("[DEBUG] Created product from DB: ID=%d, StockQuantity=%d, LowStockThreshold=%d, CostPrice=%f, IsActive=%v\n", 
			createdProduct.ID, createdProduct.StockQuantity, createdProduct.LowStockThreshold, createdProduct.CostPrice, createdProduct.IsActive)))
	} else {
		gin.DefaultWriter.Write([]byte("[ERROR] Created product is nil after fetch\n"))
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

	// Set computed fields for response
	createdProduct.Stock = createdProduct.StockQuantity
	createdProduct.MinStock = createdProduct.LowStockThreshold
	if createdProduct.BrandRef != nil {
		createdProduct.Brand = createdProduct.BrandRef.Name
	}
	status := "active"
	if !createdProduct.IsActive {
		status = "inactive"
	}
	createdProduct.Status = status

	c.JSON(http.StatusCreated, dto.ProductResponse{
		ID:           createdProduct.ID,
		ResourceID:   createdProduct.ResourceID,
		Name:         createdProduct.Name,
		Description:  createdProduct.Description,
		SKU:          createdProduct.SKU,
		Price:        createdProduct.Price,
		ComparePrice: createdProduct.ComparePrice,
		Cost:         createdProduct.CostPrice,
		Stock:        createdProduct.StockQuantity,
		MinStock:     createdProduct.LowStockThreshold,
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

	// Debug: Log update request
	if req.StockQuantity != nil {
		gin.DefaultWriter.Write([]byte(fmt.Sprintf("[DEBUG] UpdateProduct Request: StockQuantity=%d, LowStockThreshold=%v\n", 
			*req.StockQuantity, req.LowStockThreshold)))
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
		// Update slug when name changes
		product.Slug = strings.ToLower(strings.ReplaceAll(strings.TrimSpace(*req.Name), " ", "-"))
	}
	if req.ShortDescription != nil {
		product.ShortDescription = *req.ShortDescription
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
	if req.CostPrice != nil {
		product.CostPrice = *req.CostPrice
	}
	if req.StockQuantity != nil {
		product.StockQuantity = *req.StockQuantity
		product.Stock = *req.StockQuantity // Update alias
	}
	if req.LowStockThreshold != nil {
		product.LowStockThreshold = *req.LowStockThreshold
		product.MinStock = *req.LowStockThreshold // Update alias
	}
	if req.Weight != nil {
		product.Weight = *req.Weight
	}
	if req.Length != nil {
		product.Length = *req.Length
	}
	if req.Width != nil {
		product.Width = *req.Width
	}
	if req.Height != nil {
		product.Height = *req.Height
	}
	if req.BrandID != nil {
		product.BrandID = req.BrandID
	}
	if req.IsActive != nil {
		product.IsActive = *req.IsActive
	}
	if req.IsFeatured != nil {
		product.IsFeatured = *req.IsFeatured
	}
	if req.IsDigital != nil {
		product.IsDigital = *req.IsDigital
	}
	if req.RequiresShipping != nil {
		product.RequiresShipping = *req.RequiresShipping
	}
	if req.Taxable != nil {
		product.Taxable = *req.Taxable
	}
	if req.TrackQuantity != nil {
		product.TrackQuantity = *req.TrackQuantity
	}
	if req.AllowBackorder != nil {
		product.AllowBackorder = *req.AllowBackorder
	}
	if req.MetaTitle != nil {
		product.MetaTitle = *req.MetaTitle
	}
	if req.MetaDescription != nil {
		product.MetaDescription = *req.MetaDescription
	}
	// Debug: Log product before update
	gin.DefaultWriter.Write([]byte(fmt.Sprintf("[DEBUG] Product before update: ID=%d, StockQuantity=%d, LowStockThreshold=%d, CostPrice=%f\n", 
		product.ID, product.StockQuantity, product.LowStockThreshold, product.CostPrice)))

	// Update product FIRST (before category association, to preserve all field changes)
	if err := h.productRepo.Update(ctx, product); err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to update product",
			Message: err.Error(),
		})
		return
	}

	// Handle category association AFTER saving product fields
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
		// Reload product to get fresh state for association update
		product, _ = h.productRepo.GetByID(ctx, product.ID)
		if product != nil {
			var cat models.Category
			cat.ID = category.ID
			product.Categories = []models.Category{cat}
			// Save category association
			h.productRepo.Update(ctx, product)
		}
	}

	// Handle images update if provided
	if req.Images != nil {
		// Delete existing images
		if err := h.db.WithContext(ctx).Where("product_id = ?", product.ID).Delete(&models.Image{}).Error; err != nil {
			c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Error:   "Failed to delete existing images",
				Message: err.Error(),
			})
			return
		}

		// Ensure only one primary image
		hasPrimary := false
		for i := range req.Images {
			if req.Images[i].IsPrimary {
				if hasPrimary {
					req.Images[i].IsPrimary = false
				}
				hasPrimary = true
			}
		}
		// If no primary, make first one primary
		if !hasPrimary && len(req.Images) > 0 {
			req.Images[0].IsPrimary = true
		}

		// Create new image records
		for _, imgReq := range req.Images {
			image := &models.Image{
				ResourceID: uuid.New().String(),
				ProductID:  product.ID,
				URL:        imgReq.URL,
				Alt:        imgReq.Alt,
				SortOrder:  imgReq.SortOrder,
				IsPrimary:  imgReq.IsPrimary,
			}
			if err := h.db.WithContext(ctx).Create(image).Error; err != nil {
				c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
					Error:   "Failed to save image",
					Message: err.Error(),
				})
				return
			}
		}
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

	// Set computed fields for response
	updatedProduct.Stock = updatedProduct.StockQuantity
	updatedProduct.MinStock = updatedProduct.LowStockThreshold
	if updatedProduct.BrandRef != nil {
		updatedProduct.Brand = updatedProduct.BrandRef.Name
	}
	status := "active"
	if !updatedProduct.IsActive {
		status = "inactive"
	}
	updatedProduct.Status = status

	c.JSON(http.StatusOK, dto.ProductResponse{
		ID:           updatedProduct.ID,
		ResourceID:   updatedProduct.ResourceID,
		Name:         updatedProduct.Name,
		Description:  updatedProduct.Description,
		SKU:          updatedProduct.SKU,
		Price:        updatedProduct.Price,
		ComparePrice: updatedProduct.ComparePrice,
		Cost:         updatedProduct.CostPrice,
		Stock:        updatedProduct.StockQuantity,
		MinStock:     updatedProduct.LowStockThreshold,
		Weight:       updatedProduct.Weight,
		Dimensions:   updatedProduct.Dimensions,
		Brand:        updatedProduct.Brand,
		Model:        updatedProduct.Model,
		Status:       status,
		IsFeatured:   updatedProduct.IsFeatured,
		IsDigital:    updatedProduct.IsDigital,
		CategoryID:   product.CategoryID,
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

