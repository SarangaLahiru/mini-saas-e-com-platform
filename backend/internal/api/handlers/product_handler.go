package handlers

import (
	"net/http"
	"strconv"

	"electronics-store/internal/dto"
	"electronics-store/internal/usecase"

	"github.com/gin-gonic/gin"
)

type ProductHandler struct {
	productUsecase usecase.ProductUsecase
}

func NewProductHandler(productUsecase usecase.ProductUsecase) *ProductHandler {
	return &ProductHandler{
		productUsecase: productUsecase,
	}
}

// List godoc
// @Summary List products
// @Description Get a list of products with filtering and pagination
// @Tags products
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Param search query string false "Search query"
// @Param category_id query int false "Category ID"
// @Param brand query string false "Brand filter"
// @Param min_price query number false "Minimum price"
// @Param max_price query number false "Maximum price"
// @Param status query string false "Status filter"
// @Param is_featured query bool false "Featured filter"
// @Param sort_by query string false "Sort field"
// @Param sort_order query string false "Sort order" Enums(asc, desc)
// @Success 200 {object} dto.ProductListResponse
// @Failure 400 {object} dto.ErrorResponse
// @Router /products [get]
func (h *ProductHandler) List(c *gin.Context) {
	var req dto.ProductListRequest
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
		req.Limit = 10
	}
	if req.SortBy == "" {
		req.SortBy = "created_at"
	}
	if req.SortOrder == "" {
		req.SortOrder = "desc"
	}

	// Convert to filters map
	filters := make(map[string]interface{})
	if req.CategoryID > 0 {
		filters["category_id"] = req.CategoryID
	}
	// Support multiple brands via comma-separated list: brand=Apple,Samsung
    if req.Brand != "" {
        // Expect brand to be comma-separated slugs; fallback code remains in repo for names
        filters["brand_slugs"] = req.Brand
	}
    // Optional category slug support for unified filtering
    if slug := c.Query("category_slug"); slug != "" {
        filters["category_slug"] = slug
    }
	if req.MinPrice > 0 {
		filters["min_price"] = req.MinPrice
	}
	if req.MaxPrice > 0 {
		filters["max_price"] = req.MaxPrice
	}
	if req.Status != "" {
		filters["status"] = req.Status
	}
	if req.IsFeatured != nil {
		filters["is_featured"] = *req.IsFeatured
	}
	if req.Search != "" {
		filters["search"] = req.Search
	}
	// Optional: in_stock=1 (as query) -> stock > 0
	if c.Query("in_stock") == "1" || c.Query("in_stock") == "true" {
		filters["in_stock"] = true
	}
	filters["sort_by"] = req.SortBy
	filters["sort_order"] = req.SortOrder

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
			Status:       product.Status,
			IsFeatured:   product.IsFeatured,
			IsDigital:    product.IsDigital,
			CategoryID:   0,
			Category:     category,
			Images:       images,
			CreatedAt:    product.CreatedAt,
			UpdatedAt:    product.UpdatedAt,
		})
	}

	c.JSON(http.StatusOK, dto.ProductListResponse{
		Products: productResponses,
		Total:    total,
		Page:     req.Page,
		Limit:    req.Limit,
	})
}

// GetBrands godoc
// @Summary List brands
// @Tags brands
// @Produce json
// @Success 200 {array} dto.BrandResponse
// @Router /brands [get]
func (h *ProductHandler) GetBrands(c *gin.Context) {
    brands, err := h.productUsecase.ListBrands(c.Request.Context())
    if err != nil {
        c.JSON(http.StatusInternalServerError, dto.ErrorResponse{ Error: "Failed to list brands", Message: err.Error() })
        return
    }
    resp := make([]dto.BrandResponse, 0, len(brands))
    for _, b := range brands {
        resp = append(resp, dto.BrandResponse{ ID: b.ID, Name: b.Name, Slug: b.Slug, IsActive: b.IsActive })
    }
    c.JSON(http.StatusOK, resp)
}

// SuggestProducts godoc
// @Summary Suggest products for autocomplete
// @Tags search
// @Produce json
// @Param q query string true "Query"
// @Param limit query int false "Max results" default(8)
// @Success 200 {array} dto.ProductSuggestResponse
// @Router /search/suggest [get]
func (h *ProductHandler) SuggestProducts(c *gin.Context) {
    q := c.Query("q")
    if len(q) < 2 {
        c.JSON(http.StatusOK, []dto.ProductSuggestResponse{})
        return
    }
    limitStr := c.DefaultQuery("limit", "8")
    lim, _ := strconv.Atoi(limitStr)
    products, err := h.productUsecase.Suggest(c.Request.Context(), q, lim)
    if err != nil {
        c.JSON(http.StatusInternalServerError, dto.ErrorResponse{ Error: "Failed to suggest", Message: err.Error() })
        return
    }
    resp := make([]dto.ProductSuggestResponse, 0, len(products))
    for _, p := range products {
        image := ""
        if len(p.Images) > 0 {
            image = p.Images[0].URL
        }
        brand := ""
        if p.BrandRef != nil {
            brand = p.BrandRef.Name
        }
        resp = append(resp, dto.ProductSuggestResponse{
            ID: p.ID, ResourceID: p.ResourceID, Name: p.Name, Price: p.Price, Image: image, Brand: brand, Slug: p.ResourceID,
        })
    }
    c.JSON(http.StatusOK, resp)
}

// GetByID godoc
// @Summary Get product by ID
// @Description Get a single product by its ID
// @Tags products
// @Accept json
// @Produce json
// @Param id path string true "Product Resource ID"
// @Success 200 {object} dto.ProductResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Router /products/{id} [get]
func (h *ProductHandler) GetByID(c *gin.Context) {
	resourceID := c.Param("id")
	if resourceID == "" {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: "Product ID is required",
		})
		return
	}

	product, err := h.productUsecase.GetByResourceID(c.Request.Context(), resourceID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to get product",
			Message: err.Error(),
		})
		return
	}

	if product == nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{
			Error:   "Product not found",
			Message: "Product with the given ID does not exist",
		})
		return
	}

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
	category = dto.CategoryResponse{
		ResourceID:  product.Category.ResourceID,
		Name:        product.Category.Name,
		Slug:        product.Category.Slug,
		Description: product.Category.Description,
		Image:       product.Category.Image,
		ParentID:    product.Category.ParentID,
		SortOrder:   product.Category.SortOrder,
		IsActive:    product.Category.IsActive,
		CreatedAt:   product.Category.CreatedAt,
		UpdatedAt:   product.Category.UpdatedAt,
	}

	c.JSON(http.StatusOK, dto.ProductResponse{
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
		Status:       product.Status,
		IsFeatured:   product.IsFeatured,
		IsDigital:    product.IsDigital,
		CategoryID:   product.CategoryID,
		Category:     category,
		Images:       images,
		CreatedAt:    product.CreatedAt,
		UpdatedAt:    product.UpdatedAt,
	})
}

// GetRelatedProducts godoc
// @Summary Get related products
// @Description Get products related to a specific product (same category)
// @Tags products
// @Produce json
// @Param id path string true "Product resource ID"
// @Success 200 {object} dto.ProductListResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Router /products/{id}/related [get]
func (h *ProductHandler) GetRelatedProducts(c *gin.Context) {
	resourceID := c.Param("id")
	if resourceID == "" {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: "Product ID is required",
		})
		return
	}

	// Get the current product to find its category
	product, err := h.productUsecase.GetByResourceID(c.Request.Context(), resourceID)
	if err != nil || product == nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{
			Error:   "Product not found",
			Message: "Product with the given ID does not exist",
		})
		return
	}

	// Get related products from the same category (exclude current product by getting 5, we'll filter to 4)
	filters := map[string]interface{}{
		"category_id": product.CategoryID,
		"status":      "active",
	}

	products, total, err := h.productUsecase.List(c.Request.Context(), 1, 5, filters)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to get related products",
			Message: err.Error(),
		})
		return
	}

	// Convert to DTO and filter out the current product
	var productResponses []dto.ProductResponse
	for _, p := range products {
		if p.ResourceID != resourceID {
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

			productResponses = append(productResponses, dto.ProductResponse{
				ID:           p.ID,
				ResourceID:   p.ResourceID,
				Name:         p.Name,
				Description:  p.Description,
				SKU:          p.SKU,
				Price:        p.Price,
				ComparePrice: p.ComparePrice,
				Stock:        p.Stock,
				Brand:        p.Brand,
				Model:        p.Model,
				Status:       p.Status,
				IsFeatured:   p.IsFeatured,
				Images:       images,
				CreatedAt:    p.CreatedAt,
				UpdatedAt:    p.UpdatedAt,
			})
		}
	}

	// Limit to 4 products
	if len(productResponses) > 4 {
		productResponses = productResponses[:4]
	}

	c.JSON(http.StatusOK, dto.ProductListResponse{
		Products: productResponses,
		Total:    total,
		Page:     1,
		Limit:    4,
	})
}

// Search godoc
// @Summary Search products
// @Description Search products by query string
// @Tags products
// @Accept json
// @Produce json
// @Param q query string true "Search query"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Success 200 {object} dto.ProductListResponse
// @Failure 400 {object} dto.ErrorResponse
// @Router /products/search [get]
func (h *ProductHandler) Search(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: "Search query is required",
		})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	products, total, err := h.productUsecase.Search(c.Request.Context(), query, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to search products",
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
		category = dto.CategoryResponse{
			ResourceID:  product.Category.ResourceID,
			Name:        product.Category.Name,
			Slug:        product.Category.Slug,
			Description: product.Category.Description,
			Image:       product.Category.Image,
			ParentID:    product.Category.ParentID,
			SortOrder:   product.Category.SortOrder,
			IsActive:    product.Category.IsActive,
			CreatedAt:   product.Category.CreatedAt,
			UpdatedAt:   product.Category.UpdatedAt,
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
			Status:       product.Status,
			IsFeatured:   product.IsFeatured,
			IsDigital:    product.IsDigital,
			CategoryID:   product.CategoryID,
			Category:     category,
			Images:       images,
			CreatedAt:    product.CreatedAt,
			UpdatedAt:    product.UpdatedAt,
		})
	}

	c.JSON(http.StatusOK, dto.ProductListResponse{
		Products: productResponses,
		Total:    total,
		Page:     page,
		Limit:    limit,
	})
}

// GetFeatured godoc
// @Summary Get featured products
// @Description Get a list of featured products
// @Tags products
// @Accept json
// @Produce json
// @Param limit query int false "Items per page" default(10)
// @Success 200 {object} dto.ProductListResponse
// @Failure 400 {object} dto.ErrorResponse
// @Router /products/featured [get]
func (h *ProductHandler) GetFeatured(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	products, err := h.productUsecase.GetFeatured(c.Request.Context(), limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to get featured products",
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
		category = dto.CategoryResponse{
			ResourceID:  product.Category.ResourceID,
			Name:        product.Category.Name,
			Slug:        product.Category.Slug,
			Description: product.Category.Description,
			Image:       product.Category.Image,
			ParentID:    product.Category.ParentID,
			SortOrder:   product.Category.SortOrder,
			IsActive:    product.Category.IsActive,
			CreatedAt:   product.Category.CreatedAt,
			UpdatedAt:   product.Category.UpdatedAt,
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
			Status:       product.Status,
			IsFeatured:   product.IsFeatured,
			IsDigital:    product.IsDigital,
			CategoryID:   product.CategoryID,
			Category:     category,
			Images:       images,
			CreatedAt:    product.CreatedAt,
			UpdatedAt:    product.UpdatedAt,
		})
	}

	c.JSON(http.StatusOK, dto.ProductListResponse{
		Products: productResponses,
		Total:    int64(len(productResponses)),
		Page:     1,
		Limit:    limit,
	})
}

// GetByCategory godoc
// @Summary Get products by category
// @Description Get products filtered by category
// @Tags products
// @Accept json
// @Produce json
// @Param categoryId path int true "Category ID"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Success 200 {object} dto.ProductListResponse
// @Failure 400 {object} dto.ErrorResponse
// @Router /products/category/{categoryId} [get]
func (h *ProductHandler) GetByCategory(c *gin.Context) {
	categoryIDStr := c.Param("categoryId")
	categoryID, err := strconv.ParseUint(categoryIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: "Invalid category ID",
		})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	products, err := h.productUsecase.GetByCategory(c.Request.Context(), uint(categoryID), page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to get products by category",
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
		category = dto.CategoryResponse{
			ResourceID:  product.Category.ResourceID,
			Name:        product.Category.Name,
			Slug:        product.Category.Slug,
			Description: product.Category.Description,
			Image:       product.Category.Image,
			ParentID:    product.Category.ParentID,
			SortOrder:   product.Category.SortOrder,
			IsActive:    product.Category.IsActive,
			CreatedAt:   product.Category.CreatedAt,
			UpdatedAt:   product.Category.UpdatedAt,
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
			Status:       product.Status,
			IsFeatured:   product.IsFeatured,
			IsDigital:    product.IsDigital,
			CategoryID:   product.CategoryID,
			Category:     category,
			Images:       images,
			CreatedAt:    product.CreatedAt,
			UpdatedAt:    product.UpdatedAt,
		})
	}

	c.JSON(http.StatusOK, dto.ProductListResponse{
		Products: productResponses,
		Total:    int64(len(productResponses)),
		Page:     page,
		Limit:    limit,
	})
}

// GetCategories godoc
// @Summary Get categories
// @Description Get a list of all product categories
// @Tags categories
// @Accept json
// @Produce json
// @Success 200 {object} dto.SuccessResponse
// @Router /categories [get]
func (h *ProductHandler) GetCategories(c *gin.Context) {
	// For now, return a simple response
	c.JSON(http.StatusOK, dto.SuccessResponse{
		Message: "Categories retrieved successfully",
	})
}
