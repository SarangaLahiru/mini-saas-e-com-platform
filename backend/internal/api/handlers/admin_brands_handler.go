package handlers

import (
	"fmt"
	"net/http"
	"strings"

	"electronics-store/internal/dto"
	"electronics-store/internal/domain/models"
	"electronics-store/internal/repository"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AdminBrandsHandler struct {
	brandRepo repository.BrandRepository
}

func NewAdminBrandsHandler(brandRepo repository.BrandRepository) *AdminBrandsHandler {
	return &AdminBrandsHandler{
		brandRepo: brandRepo,
	}
}

// ListBrands godoc
// @Summary List all brands (Admin)
// @Description Get a list of all brands
// @Tags admin
// @Accept json
// @Produce json
// @Success 200 {object} dto.AdminBrandListResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /admin/brands [get]
func (h *AdminBrandsHandler) ListBrands(c *gin.Context) {
	ctx := c.Request.Context()

	// Get brands
	brands, err := h.brandRepo.List(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to get brands",
			Message: err.Error(),
		})
		return
	}

	// Get total count
	total, err := h.brandRepo.Count(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to count brands",
			Message: err.Error(),
		})
		return
	}

	// Convert to response
	var brandResponses []dto.BrandResponse
	for _, brand := range brands {
		brandResponses = append(brandResponses, dto.BrandResponse{
			ID:        brand.ID,
			Name:      brand.Name,
			Slug:      brand.Slug,
			IsActive:  brand.IsActive,
			CreatedAt: brand.CreatedAt,
			UpdatedAt: brand.UpdatedAt,
		})
	}

	c.JSON(http.StatusOK, dto.AdminBrandListResponse{
		Brands: brandResponses,
		Total:  total,
	})
}

// CreateBrand godoc
// @Summary Create a new brand
// @Description Create a new brand (Admin only)
// @Tags admin
// @Accept json
// @Produce json
// @Param request body dto.CreateBrandRequest true "Brand data"
// @Success 201 {object} dto.BrandResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /admin/brands [post]
func (h *AdminBrandsHandler) CreateBrand(c *gin.Context) {
	var req dto.CreateBrandRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: err.Error(),
		})
		return
	}

	ctx := c.Request.Context()

	// Generate slug from name if not provided
	slug := req.Slug
	if slug == "" {
		slug = strings.ToLower(strings.ReplaceAll(strings.TrimSpace(req.Name), " ", "-"))
		slug = strings.ToLower(strings.ReplaceAll(slug, "[^a-z0-9-]", ""))
	}

	// Check if slug already exists
	existing, err := h.brandRepo.GetBySlug(ctx, slug)
	if err != nil && err != gorm.ErrRecordNotFound {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to check slug",
			Message: err.Error(),
		})
		return
	}
	if existing != nil {
		c.JSON(http.StatusConflict, dto.ErrorResponse{
			Error:   "Brand already exists",
			Message: "A brand with this slug already exists",
		})
		return
	}

	// Create brand
	brand := &models.Brand{
		Name:     req.Name,
		Slug:     slug,
		IsActive: req.IsActive,
	}

	if err := h.brandRepo.Create(ctx, brand); err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to create brand",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, dto.BrandResponse{
		ID:        brand.ID,
		Name:      brand.Name,
		Slug:      brand.Slug,
		IsActive:  brand.IsActive,
		CreatedAt: brand.CreatedAt,
		UpdatedAt: brand.UpdatedAt,
	})
}

// UpdateBrand godoc
// @Summary Update a brand
// @Description Update an existing brand (Admin only)
// @Tags admin
// @Accept json
// @Produce json
// @Param id path int true "Brand ID"
// @Param request body dto.UpdateBrandRequest true "Brand data"
// @Success 200 {object} dto.BrandResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /admin/brands/{id} [put]
func (h *AdminBrandsHandler) UpdateBrand(c *gin.Context) {
	idStr := c.Param("id")
	if idStr == "" {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: "Brand ID is required",
		})
		return
	}

	var req dto.UpdateBrandRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: err.Error(),
		})
		return
	}

	ctx := c.Request.Context()

	// Get existing brand
	var id uint
	if _, err := fmt.Sscanf(idStr, "%d", &id); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid brand ID",
			Message: "Brand ID must be a number",
		})
		return
	}

	brand, err := h.brandRepo.GetByID(ctx, id)
	if err != nil || brand == nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{
			Error:   "Brand not found",
			Message: "Brand with the given ID does not exist",
		})
		return
	}

	// Update fields
	if req.Name != nil {
		brand.Name = *req.Name
	}
	if req.Slug != nil {
		// Check if new slug is already taken
		existing, err := h.brandRepo.GetBySlug(ctx, *req.Slug)
		if err != nil && err != gorm.ErrRecordNotFound {
			c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Error:   "Failed to check slug",
				Message: err.Error(),
			})
			return
		}
		if existing != nil && existing.ID != brand.ID {
			c.JSON(http.StatusConflict, dto.ErrorResponse{
				Error:   "Slug already exists",
				Message: "Another brand with this slug already exists",
			})
			return
		}
		brand.Slug = *req.Slug
	}
	if req.IsActive != nil {
		brand.IsActive = *req.IsActive
	}

	// Update brand
	if err := h.brandRepo.Update(ctx, brand); err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to update brand",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.BrandResponse{
		ID:        brand.ID,
		Name:      brand.Name,
		Slug:      brand.Slug,
		IsActive:  brand.IsActive,
		CreatedAt: brand.CreatedAt,
		UpdatedAt: brand.UpdatedAt,
	})
}

// DeleteBrand godoc
// @Summary Delete a brand
// @Description Delete a brand (Admin only)
// @Tags admin
// @Accept json
// @Produce json
// @Param id path int true "Brand ID"
// @Success 200 {object} dto.SuccessResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /admin/brands/{id} [delete]
func (h *AdminBrandsHandler) DeleteBrand(c *gin.Context) {
	idStr := c.Param("id")
	if idStr == "" {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: "Brand ID is required",
		})
		return
	}

	ctx := c.Request.Context()

	// Parse ID
	var id uint
	if _, err := fmt.Sscanf(idStr, "%d", &id); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid brand ID",
			Message: "Brand ID must be a number",
		})
		return
	}

	// Check if brand exists
	brand, err := h.brandRepo.GetByID(ctx, id)
	if err != nil || brand == nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{
			Error:   "Brand not found",
			Message: "Brand with the given ID does not exist",
		})
		return
	}

	// Delete brand
	if err := h.brandRepo.Delete(ctx, id); err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to delete brand",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Message: "Brand deleted successfully",
	})
}

