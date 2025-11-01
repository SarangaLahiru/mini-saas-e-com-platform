package handlers

import (
	"net/http"
	"strconv"

	"electronics-store/internal/dto"
	"electronics-store/internal/domain/models"
	"electronics-store/internal/repository"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type AdminCategoriesHandler struct {
	categoryRepo repository.CategoryRepository
}

func NewAdminCategoriesHandler(categoryRepo repository.CategoryRepository) *AdminCategoriesHandler {
	return &AdminCategoriesHandler{
		categoryRepo: categoryRepo,
	}
}

// ListCategories godoc
// @Summary List all categories (Admin)
// @Description Get a list of all categories
// @Tags admin
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Param is_active query bool false "Active status filter"
// @Success 200 {object} dto.AdminCategoryListResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /admin/categories [get]
func (h *AdminCategoriesHandler) ListCategories(c *gin.Context) {
	var req dto.AdminCategoryListRequest
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

	ctx := c.Request.Context()
	limit := req.Limit
	offset := (req.Page - 1) * limit

	// Get categories
	categories, err := h.categoryRepo.List(ctx, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to get categories",
			Message: err.Error(),
		})
		return
	}

	// Get total count
	total, err := h.categoryRepo.Count(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to count categories",
			Message: err.Error(),
		})
		return
	}

	// Apply filters
	var filteredCategories []*models.Category
	for _, cat := range categories {
		if req.IsActive != nil && cat.IsActive != *req.IsActive {
			continue
		}
		filteredCategories = append(filteredCategories, cat)
	}

	// Convert to response
	var categoryResponses []dto.CategoryResponse
	for _, cat := range filteredCategories {
		categoryResponses = append(categoryResponses, dto.CategoryResponse{
			ResourceID:  cat.ResourceID,
			Name:        cat.Name,
			Slug:        cat.Slug,
			Description: cat.Description,
			Image:       cat.Image,
			ParentID:    cat.ParentID,
			SortOrder:   cat.SortOrder,
			IsActive:    cat.IsActive,
			CreatedAt:   cat.CreatedAt,
			UpdatedAt:   cat.UpdatedAt,
		})
	}

	c.JSON(http.StatusOK, dto.AdminCategoryListResponse{
		Categories: categoryResponses,
		Total:      total,
		Page:       req.Page,
		Limit:      req.Limit,
	})
}

// CreateCategory godoc
// @Summary Create a new category
// @Description Create a new category (Admin only)
// @Tags admin
// @Accept json
// @Produce json
// @Param request body dto.CreateCategoryRequest true "Category data"
// @Success 201 {object} dto.CategoryResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /admin/categories [post]
func (h *AdminCategoriesHandler) CreateCategory(c *gin.Context) {
	var req dto.CreateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: err.Error(),
		})
		return
	}

	ctx := c.Request.Context()

	// Check if slug already exists
	existing, err := h.categoryRepo.GetBySlug(ctx, req.Slug)
	if err != nil && err != gorm.ErrRecordNotFound {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to check slug",
			Message: err.Error(),
		})
		return
	}
	if existing != nil {
		c.JSON(http.StatusConflict, dto.ErrorResponse{
			Error:   "Slug already exists",
			Message: "A category with this slug already exists",
		})
		return
	}

	// Create category
	category := &models.Category{
		ResourceID:  uuid.New().String(),
		Name:        req.Name,
		Slug:        req.Slug,
		Description: req.Description,
		Image:       req.Image,
		ParentID:    req.ParentID,
		SortOrder:   req.SortOrder,
		IsActive:    req.IsActive,
	}

	if err := h.categoryRepo.Create(ctx, category); err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to create category",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, dto.CategoryResponse{
		ResourceID:  category.ResourceID,
		Name:        category.Name,
		Slug:        category.Slug,
		Description: category.Description,
		Image:       category.Image,
		ParentID:    category.ParentID,
		SortOrder:   category.SortOrder,
		IsActive:    category.IsActive,
		CreatedAt:   category.CreatedAt,
		UpdatedAt:   category.UpdatedAt,
	})
}

// UpdateCategory godoc
// @Summary Update a category
// @Description Update an existing category (Admin only)
// @Tags admin
// @Accept json
// @Produce json
// @Param id path string true "Category ID or Resource ID"
// @Param request body dto.UpdateCategoryRequest true "Category data"
// @Success 200 {object} dto.CategoryResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /admin/categories/{id} [put]
func (h *AdminCategoriesHandler) UpdateCategory(c *gin.Context) {
	idStr := c.Param("id")
	if idStr == "" {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: "Category ID is required",
		})
		return
	}

	var req dto.UpdateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: err.Error(),
		})
		return
	}

	ctx := c.Request.Context()

	// Get existing category (try by ID first, then by resource_id)
	var category *models.Category
	var err error
	if id, parseErr := strconv.ParseUint(idStr, 10, 32); parseErr == nil {
		category, err = h.categoryRepo.GetByID(ctx, uint(id))
	} else {
		category, err = h.categoryRepo.GetByResourceID(ctx, idStr)
	}

	if err != nil || category == nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{
			Error:   "Category not found",
			Message: "Category with the given ID does not exist",
		})
		return
	}

	// Update fields
	if req.Name != nil {
		category.Name = *req.Name
	}
	if req.Slug != nil {
		// Check if new slug is already taken
		existing, err := h.categoryRepo.GetBySlug(ctx, *req.Slug)
		if err != nil && err != gorm.ErrRecordNotFound {
			c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Error:   "Failed to check slug",
				Message: err.Error(),
			})
			return
		}
		if existing != nil && existing.ID != category.ID {
			c.JSON(http.StatusConflict, dto.ErrorResponse{
				Error:   "Slug already exists",
				Message: "Another category with this slug already exists",
			})
			return
		}
		category.Slug = *req.Slug
	}
	if req.Description != nil {
		category.Description = *req.Description
	}
	if req.Image != nil {
		category.Image = *req.Image
	}
	if req.ParentID != nil {
		category.ParentID = req.ParentID
	}
	if req.SortOrder != nil {
		category.SortOrder = *req.SortOrder
	}
	if req.IsActive != nil {
		category.IsActive = *req.IsActive
	}

	// Update category
	if err := h.categoryRepo.Update(ctx, category); err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to update category",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.CategoryResponse{
		ResourceID:  category.ResourceID,
		Name:        category.Name,
		Slug:        category.Slug,
		Description: category.Description,
		Image:       category.Image,
		ParentID:    category.ParentID,
		SortOrder:   category.SortOrder,
		IsActive:    category.IsActive,
		CreatedAt:   category.CreatedAt,
		UpdatedAt:   category.UpdatedAt,
	})
}

// DeleteCategory godoc
// @Summary Delete a category
// @Description Delete a category (Admin only)
// @Tags admin
// @Accept json
// @Produce json
// @Param id path string true "Category ID or Resource ID"
// @Success 200 {object} dto.SuccessResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /admin/categories/{id} [delete]
func (h *AdminCategoriesHandler) DeleteCategory(c *gin.Context) {
	idStr := c.Param("id")
	if idStr == "" {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: "Category ID is required",
		})
		return
	}

	ctx := c.Request.Context()

	// Get category to find its ID
	var category *models.Category
	var err error
	if id, parseErr := strconv.ParseUint(idStr, 10, 32); parseErr == nil {
		category, err = h.categoryRepo.GetByID(ctx, uint(id))
		if category != nil {
			id = uint64(category.ID)
		}
	} else {
		category, err = h.categoryRepo.GetByResourceID(ctx, idStr)
		if category != nil {
			id = uint64(category.ID)
		}
	}

	if err != nil || category == nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{
			Error:   "Category not found",
			Message: "Category with the given ID does not exist",
		})
		return
	}

	// Delete category
	if err := h.categoryRepo.Delete(ctx, category.ID); err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to delete category",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Message: "Category deleted successfully",
	})
}


