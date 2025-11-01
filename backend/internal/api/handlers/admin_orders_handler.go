package handlers

import (
	"net/http"

	"electronics-store/internal/dto"
	"electronics-store/internal/domain/models"
	"electronics-store/internal/repository"

	"github.com/gin-gonic/gin"
)

type AdminOrdersHandler struct {
	orderRepo repository.OrderRepository
}

func NewAdminOrdersHandler(orderRepo repository.OrderRepository) *AdminOrdersHandler {
	return &AdminOrdersHandler{
		orderRepo: orderRepo,
	}
}

// ListOrders godoc
// @Summary List all orders (Admin)
// @Description Get a list of all orders with admin-specific filters
// @Tags admin
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(20)
// @Param status query string false "Status filter"
// @Param user_id query int false "User ID filter"
// @Param search query string false "Search by order number"
// @Success 200 {object} dto.AdminOrderListResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /admin/orders [get]
func (h *AdminOrdersHandler) ListOrders(c *gin.Context) {
	var req dto.AdminOrderListRequest
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

	// Build query - for admin, we need to list all orders
	// Note: OrderRepository.List with userID = 0 should return all orders
	orders, err := h.orderRepo.List(ctx, 0, limit, offset) // userID = 0 means all orders
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to get orders",
			Message: err.Error(),
		})
		return
	}

	// Apply filters
	var filteredOrders []*models.Order
	for _, order := range orders {
		// Filter by status
		if req.Status != "" && order.Status != req.Status {
			continue
		}
		// Filter by user_id
		if req.UserID > 0 && order.UserID != req.UserID {
			continue
		}
		// Filter by search (order number)
		if req.Search != "" && order.OrderNumber != req.Search {
			continue
		}
		filteredOrders = append(filteredOrders, order)
	}

	total, err := h.orderRepo.Count(ctx, 0) // Get total count for all orders
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to count orders",
			Message: err.Error(),
		})
		return
	}

	// Convert to response DTOs
	var orderResponses []dto.AdminOrderDetailResponse
	for _, order := range filteredOrders {
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

		// Convert customer info
		customer := dto.UserSummary{
			ID:        order.User.ID,
			FirstName: order.User.FirstName,
			LastName:  order.User.LastName,
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
			Customer: customer,
			Items:    items,
		})
	}

	c.JSON(http.StatusOK, dto.AdminOrderListResponse{
		Orders: orderResponses,
		Total:  total,
		Page:   req.Page,
		Limit:  req.Limit,
	})
}

// UpdateOrderStatus godoc
// @Summary Update order status
// @Description Update the status of an order (Admin only)
// @Tags admin
// @Accept json
// @Produce json
// @Param id path string true "Order Resource ID"
// @Param request body dto.UpdateOrderStatusRequest true "Status update"
// @Success 200 {object} dto.AdminOrderDetailResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /admin/orders/{id}/status [put]
func (h *AdminOrdersHandler) UpdateOrderStatus(c *gin.Context) {
	resourceID := c.Param("id")
	if resourceID == "" {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: "Order ID is required",
		})
		return
	}

	var req dto.UpdateOrderStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: err.Error(),
		})
		return
	}

	ctx := c.Request.Context()

	// Get existing order
	order, err := h.orderRepo.GetByResourceID(ctx, resourceID)
	if err != nil || order == nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{
			Error:   "Order not found",
			Message: "Order with the given ID does not exist",
		})
		return
	}

	// Update status
	order.Status = req.Status
	if req.Notes != "" {
		order.Notes = req.Notes
	}

	// Update order
	if err := h.orderRepo.Update(ctx, order); err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to update order",
			Message: err.Error(),
		})
		return
	}

	// Fetch updated order
	updatedOrder, err := h.orderRepo.GetByResourceID(ctx, resourceID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to fetch updated order",
			Message: err.Error(),
		})
		return
	}

	// Convert to response
	var items []dto.OrderItemResponse
	for _, item := range updatedOrder.OrderItems {
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

	customer := dto.UserSummary{
		ID:        updatedOrder.User.ID,
		FirstName: updatedOrder.User.FirstName,
		LastName:  updatedOrder.User.LastName,
	}

	c.JSON(http.StatusOK, dto.AdminOrderDetailResponse{
		OrderResponse: dto.OrderResponse{
			ResourceID:     updatedOrder.ResourceID,
			OrderNumber:    updatedOrder.OrderNumber,
			UserID:         updatedOrder.UserID,
			Status:         updatedOrder.Status,
			PaymentStatus:  updatedOrder.PaymentStatus,
			Subtotal:       updatedOrder.Subtotal,
			TaxAmount:      updatedOrder.TaxAmount,
			ShippingCost:   updatedOrder.ShippingCost,
			DiscountAmount: updatedOrder.DiscountAmount,
			Total:          updatedOrder.Total,
			Currency:       updatedOrder.Currency,
			Notes:          updatedOrder.Notes,
			CreatedAt:      updatedOrder.CreatedAt.Format("2006-01-02T15:04:05Z07:00"),
			UpdatedAt:      updatedOrder.UpdatedAt.Format("2006-01-02T15:04:05Z07:00"),
		},
		Customer: customer,
		Items:    items,
	})
}

