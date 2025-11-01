package handlers

import (
	"net/http"

	"electronics-store/internal/dto"
	"electronics-store/internal/repository"

	"github.com/gin-gonic/gin"
)

type AdminUsersHandler struct {
	userRepo repository.UserRepository
	orderRepo repository.OrderRepository
}

func NewAdminUsersHandler(
	userRepo repository.UserRepository,
	orderRepo repository.OrderRepository,
) *AdminUsersHandler {
	return &AdminUsersHandler{
		userRepo:  userRepo,
		orderRepo: orderRepo,
	}
}

// ListUsers godoc
// @Summary List all users/customers (Admin)
// @Description Get a list of all users with admin-specific filters
// @Tags admin
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Param search query string false "Search query"
// @Param is_active query bool false "Active status filter"
// @Param is_admin query bool false "Admin status filter"
// @Success 200 {object} dto.AdminUserListResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /admin/users [get]
func (h *AdminUsersHandler) ListUsers(c *gin.Context) {
	var req dto.AdminUserListRequest
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

	// Get users
	users, err := h.userRepo.List(ctx, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to get users",
			Message: err.Error(),
		})
		return
	}

	// Get total count
	total, err := h.userRepo.Count(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to count users",
			Message: err.Error(),
		})
		return
	}

	// Apply filters and convert to response
	var userResponses []dto.AdminUserResponse
	for _, user := range users {
		// Apply filters
		if req.IsActive != nil && user.IsActive != *req.IsActive {
			continue
		}
		if req.IsAdmin != nil && user.IsAdmin != *req.IsAdmin {
			continue
		}
		if req.Search != "" {
			searchLower := req.Search
			if !containsIgnoreCase(user.Email, searchLower) &&
				!containsIgnoreCase(user.Username, searchLower) &&
				!containsIgnoreCase(user.FirstName, searchLower) &&
				!containsIgnoreCase(user.LastName, searchLower) {
				continue
			}
		}

		// Get user order count and total spent
		userOrders, _ := h.orderRepo.List(ctx, user.ID, 1000, 0) // Get all orders for this user
		var totalSpent float64
		var ordersCount int64
		for _, order := range userOrders {
			if order.Status != "cancelled" && order.Status != "refunded" {
				totalSpent += order.Total
			}
			ordersCount++
		}

		userResponses = append(userResponses, dto.AdminUserResponse{
			ID:          user.ID,
			ResourceID: user.ResourceID,
			Username:    user.Username,
			Email:       user.Email,
			FirstName:   user.FirstName,
			LastName:    user.LastName,
			Phone:       user.Phone,
			Avatar:      user.Avatar,
			IsActive:    user.IsActive,
			IsAdmin:     user.IsAdmin,
			IsVerified:  user.IsVerified,
			CreatedAt:   user.CreatedAt,
			UpdatedAt:   user.UpdatedAt,
			LastLoginAt: user.LastLoginAt,
			OrdersCount: ordersCount,
			TotalSpent:  totalSpent,
		})
	}

	c.JSON(http.StatusOK, dto.AdminUserListResponse{
		Users: userResponses,
		Total: total,
		Page:  req.Page,
		Limit: req.Limit,
	})
}

// UpdateUser godoc
// @Summary Update a user
// @Description Update user information (Admin only)
// @Tags admin
// @Accept json
// @Produce json
// @Param id path string true "User Resource ID"
// @Param request body dto.UpdateUserRequest true "User data"
// @Success 200 {object} dto.AdminUserResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /admin/users/{id} [put]
func (h *AdminUsersHandler) UpdateUser(c *gin.Context) {
	resourceID := c.Param("id")
	if resourceID == "" {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: "User ID is required",
		})
		return
	}

	var req dto.UpdateUserRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: err.Error(),
		})
		return
	}

	ctx := c.Request.Context()

	// Get existing user
	user, err := h.userRepo.GetByResourceID(ctx, resourceID)
	if err != nil || user == nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{
			Error:   "User not found",
			Message: "User with the given ID does not exist",
		})
		return
	}

	// Update fields
	if req.FirstName != nil {
		user.FirstName = *req.FirstName
	}
	if req.LastName != nil {
		user.LastName = *req.LastName
	}
	if req.Phone != nil {
		user.Phone = *req.Phone
	}
	if req.IsActive != nil {
		user.IsActive = *req.IsActive
	}
	if req.IsAdmin != nil {
		user.IsAdmin = *req.IsAdmin
	}

	// Update user
	if err := h.userRepo.Update(ctx, user); err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to update user",
			Message: err.Error(),
		})
		return
	}

	// Fetch updated user
	updatedUser, err := h.userRepo.GetByResourceID(ctx, resourceID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to fetch updated user",
			Message: err.Error(),
		})
		return
	}

	// Get user stats
	userOrders, _ := h.orderRepo.List(ctx, updatedUser.ID, 1000, 0)
	var totalSpent float64
	var ordersCount int64
	for _, order := range userOrders {
		if order.Status != "cancelled" && order.Status != "refunded" {
			totalSpent += order.Total
		}
		ordersCount++
	}

	c.JSON(http.StatusOK, dto.AdminUserResponse{
		ID:          updatedUser.ID,
		ResourceID: updatedUser.ResourceID,
		Username:    updatedUser.Username,
		Email:       updatedUser.Email,
		FirstName:   updatedUser.FirstName,
		LastName:    updatedUser.LastName,
		Phone:       updatedUser.Phone,
		Avatar:      updatedUser.Avatar,
		IsActive:    updatedUser.IsActive,
		IsAdmin:     updatedUser.IsAdmin,
		IsVerified:  updatedUser.IsVerified,
		CreatedAt:   updatedUser.CreatedAt,
		UpdatedAt:   updatedUser.UpdatedAt,
		LastLoginAt: updatedUser.LastLoginAt,
		OrdersCount: ordersCount,
		TotalSpent:  totalSpent,
	})
}

// GetUser godoc
// @Summary Get user details with orders (Admin)
// @Description Get detailed information about a user including all their orders
// @Tags admin
// @Accept json
// @Produce json
// @Param id path string true "User Resource ID"
// @Success 200 {object} dto.AdminUserDetailResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /admin/users/{id} [get]
func (h *AdminUsersHandler) GetUser(c *gin.Context) {
	resourceID := c.Param("id")
	if resourceID == "" {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: "User ID is required",
		})
		return
	}

	ctx := c.Request.Context()

	// Get user
	user, err := h.userRepo.GetByResourceID(ctx, resourceID)
	if err != nil || user == nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{
			Error:   "User not found",
			Message: "User with the given ID does not exist",
		})
		return
	}

	// Get all orders for this user
	orders, err := h.orderRepo.List(ctx, user.ID, 1000, 0)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to get orders",
			Message: err.Error(),
		})
		return
	}

	// Calculate stats
	var totalSpent float64
	var ordersCount int64
	var orderResponses []dto.AdminOrderDetailResponse

	for _, order := range orders {
		if order.Status != "cancelled" && order.Status != "refunded" {
			totalSpent += order.Total
		}
		ordersCount++

		// Convert order items
		var items []dto.OrderItemResponse
		for _, item := range order.OrderItems {
			items = append(items, dto.OrderItemResponse{
				ResourceID: item.ResourceID,
				Product: dto.ProductSummaryResponse{
					ResourceID: item.Product.ResourceID,
					Name:       item.Product.Name,
					SKU:        item.Product.SKU,
					Price:      item.Price,
				},
				Quantity: item.Quantity,
				Price:    item.Price,
				Total:    item.Total,
			})
		}

		orderResponses = append(orderResponses, dto.AdminOrderDetailResponse{
			OrderResponse: dto.OrderResponse{
				ResourceID:     order.ResourceID,
				OrderNumber:    order.OrderNumber,
				UserID:         order.UserID,
				Status:         order.Status,
				PaymentStatus:  order.PaymentStatus,
				Subtotal:       order.Subtotal,
				TaxAmount:      order.TaxAmount,
				ShippingCost:   order.ShippingCost,
				DiscountAmount: order.DiscountAmount,
				Total:          order.Total,
				Currency:       order.Currency,
				Notes:          order.Notes,
				CreatedAt:      order.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
				UpdatedAt:      order.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
			},
			Customer: dto.UserSummary{
				ID:        user.ID,
				FirstName: user.FirstName,
				LastName:  user.LastName,
			},
			Items: items,
		})
	}

	c.JSON(http.StatusOK, dto.AdminUserDetailResponse{
		User: dto.AdminUserResponse{
			ID:          user.ID,
			ResourceID: user.ResourceID,
			Username:    user.Username,
			Email:       user.Email,
			FirstName:   user.FirstName,
			LastName:    user.LastName,
			Phone:       user.Phone,
			Avatar:      user.Avatar,
			IsActive:    user.IsActive,
			IsAdmin:     user.IsAdmin,
			IsVerified:  user.IsVerified,
			CreatedAt:   user.CreatedAt,
			UpdatedAt:   user.UpdatedAt,
			LastLoginAt: user.LastLoginAt,
			OrdersCount: ordersCount,
			TotalSpent:  totalSpent,
		},
		Orders: orderResponses,
	})
}

// Helper function
func containsIgnoreCase(s, substr string) bool {
	if len(s) < len(substr) {
		return false
	}
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	// Simple case-insensitive check
	if len(s) >= len(substr) {
		for i := 0; i <= len(s)-len(substr); i++ {
			match := true
			for j := 0; j < len(substr); j++ {
				if toLower(s[i+j]) != toLower(substr[j]) {
					match = false
					break
				}
			}
			if match {
				return true
			}
		}
	}
	return false
}

func toLower(b byte) byte {
	if b >= 'A' && b <= 'Z' {
		return b + 32
	}
	return b
}

