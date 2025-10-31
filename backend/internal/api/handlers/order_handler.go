package handlers

import (
	"net/http"
	"strconv"

	"electronics-store/internal/dto"
	"electronics-store/internal/domain/models"
	"electronics-store/internal/usecase"

	"github.com/gin-gonic/gin"
)

type OrderHandler struct {
	orderUsecase usecase.OrderUsecase
}

func NewOrderHandler(orderUsecase usecase.OrderUsecase) *OrderHandler {
	return &OrderHandler{
		orderUsecase: orderUsecase,
	}
}

// List godoc
// @Summary List orders
// @Description Get a list of orders for the current user
// @Tags orders
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Success 200 {object} dto.OrderListResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Router /orders [get]
func (h *OrderHandler) List(c *gin.Context) {
	// Get user ID from context (set by auth middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error:   "Unauthorized",
			Message: "User not authenticated",
		})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	if page <= 0 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}

	orders, total, err := h.orderUsecase.List(c.Request.Context(), userID.(uint), page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to get orders",
			Message: err.Error(),
		})
		return
	}

	// Convert to response DTOs
	var orderResponses []dto.OrderResponse
	for _, order := range orders {
		orderResponses = append(orderResponses, dto.OrderResponse{
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
			CreatedAt:      order.CreatedAt.Format("2006-01-02T15:04:05Z"),
			UpdatedAt:      order.UpdatedAt.Format("2006-01-02T15:04:05Z"),
		})
	}

	c.JSON(http.StatusOK, dto.OrderListResponse{
		Orders: orderResponses,
		Total:  total,
		Page:   page,
		Limit:  limit,
	})
}

// GetByID godoc
// @Summary Get order by ID
// @Description Get a single order by its ID
// @Tags orders
// @Accept json
// @Produce json
// @Param id path string true "Order Resource ID"
// @Success 200 {object} dto.OrderResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Router /orders/{id} [get]
func (h *OrderHandler) GetByID(c *gin.Context) {
	resourceID := c.Param("id")
	if resourceID == "" {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: "Order ID is required",
		})
		return
	}

	order, err := h.orderUsecase.GetByResourceID(c.Request.Context(), resourceID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to get order",
			Message: err.Error(),
		})
		return
	}

	if order == nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{
			Error:   "Order not found",
			Message: "Order with the given ID does not exist",
		})
		return
	}

	c.JSON(http.StatusOK, dto.OrderResponse{
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
		CreatedAt:      order.CreatedAt.Format("2006-01-02T15:04:05Z"),
		UpdatedAt:      order.UpdatedAt.Format("2006-01-02T15:04:05Z"),
	})
}

// Create godoc
// @Summary Create order
// @Description Create a new order
// @Tags orders
// @Accept json
// @Produce json
// @Param request body dto.CreateOrderRequest true "Create order request"
// @Success 201 {object} dto.OrderResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Router /orders [post]
func (h *OrderHandler) Create(c *gin.Context) {
	// Get user ID from context
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error:   "Unauthorized",
			Message: "User not authenticated",
		})
		return
	}

	var req dto.CreateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: err.Error(),
		})
		return
	}

	// Create order (simplified implementation)
	order := &models.Order{
		UserID:        userID.(uint),
		Status:        "pending",
		PaymentStatus: "pending",
		Subtotal:      req.Subtotal,
		TaxAmount:     req.TaxAmount,
		ShippingCost:  req.ShippingCost,
		DiscountAmount: req.DiscountAmount,
		Total:         req.Total,
		Currency:      req.Currency,
		Notes:         req.Notes,
	}

	err := h.orderUsecase.Create(c.Request.Context(), order)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to create order",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, dto.OrderResponse{
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
		CreatedAt:      order.CreatedAt.Format("2006-01-02T15:04:05Z"),
		UpdatedAt:      order.UpdatedAt.Format("2006-01-02T15:04:05Z"),
	})
}

// Update godoc
// @Summary Update order
// @Description Update an existing order
// @Tags orders
// @Accept json
// @Produce json
// @Param id path string true "Order Resource ID"
// @Param request body dto.UpdateOrderRequest true "Update order request"
// @Success 200 {object} dto.OrderResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Router /orders/{id} [put]
func (h *OrderHandler) Update(c *gin.Context) {
	resourceID := c.Param("id")
	if resourceID == "" {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: "Order ID is required",
		})
		return
	}

	order, err := h.orderUsecase.GetByResourceID(c.Request.Context(), resourceID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to get order",
			Message: err.Error(),
		})
		return
	}

	if order == nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{
			Error:   "Order not found",
			Message: "Order with the given ID does not exist",
		})
		return
	}

	var req dto.UpdateOrderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: err.Error(),
		})
		return
	}

	// Update fields
	if req.Status != nil {
		order.Status = *req.Status
	}
	if req.PaymentStatus != nil {
		order.PaymentStatus = *req.PaymentStatus
	}
	if req.Notes != nil {
		order.Notes = *req.Notes
	}

	err = h.orderUsecase.Update(c.Request.Context(), order)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to update order",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.OrderResponse{
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
		CreatedAt:      order.CreatedAt.Format("2006-01-02T15:04:05Z"),
		UpdatedAt:      order.UpdatedAt.Format("2006-01-02T15:04:05Z"),
	})
}

// Delete godoc
// @Summary Delete order
// @Description Delete an order
// @Tags orders
// @Accept json
// @Produce json
// @Param id path string true "Order Resource ID"
// @Success 200 {object} dto.SuccessResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Router /orders/{id} [delete]
func (h *OrderHandler) Delete(c *gin.Context) {
	resourceID := c.Param("id")
	if resourceID == "" {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: "Order ID is required",
		})
		return
	}

	order, err := h.orderUsecase.GetByResourceID(c.Request.Context(), resourceID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to get order",
			Message: err.Error(),
		})
		return
	}

	if order == nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{
			Error:   "Order not found",
			Message: "Order with the given ID does not exist",
		})
		return
	}

	err = h.orderUsecase.Delete(c.Request.Context(), order.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to delete order",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Message: "Order deleted successfully",
	})
}