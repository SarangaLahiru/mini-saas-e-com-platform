package handlers

import (
	"net/http"
	"strings"

	"electronics-store/internal/dto"
	"electronics-store/internal/domain/models"
	"electronics-store/internal/repository"

	"github.com/gin-gonic/gin"
)

// getPaymentStatus returns a default payment status if empty
func getPaymentStatus(status string) string {
	if status == "" {
		return "pending"
	}
	return status
}

// calculateOrderPaymentStatus determines the order payment status from payments array
// Priority: refunded > failed > completed > processing > pending
func calculateOrderPaymentStatus(payments []models.Payment) string {
	if len(payments) == 0 {
		return "pending"
	}

	// Check for refunded payments first (highest priority)
	for _, payment := range payments {
		if payment.Status == "refunded" {
			return "refunded"
		}
	}

	// Check for failed payments
	for _, payment := range payments {
		if payment.Status == "failed" {
			return "failed"
		}
	}

	// Check if all payments are completed
	allCompleted := true
	hasProcessing := false
	for _, payment := range payments {
		if payment.Status == "processing" {
			hasProcessing = true
			allCompleted = false
		}
		if payment.Status != "completed" && payment.Status != "processing" {
			allCompleted = false
		}
	}

	if allCompleted && !hasProcessing {
		return "completed"
	}

	if hasProcessing {
		return "processing"
	}

	// Default to pending if any payment is pending or unknown
	return "pending"
}

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
	
	// Get all orders (we'll filter in-memory for now, can optimize later with SQL WHERE clauses)
	// For large datasets, this should be moved to database-level filtering
	orders, err := h.orderRepo.List(ctx, 0, 10000, 0) // Get a large batch for filtering
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
		if req.Status != "" && strings.ToLower(order.Status) != strings.ToLower(req.Status) {
			continue
		}
		// Filter by payment_status
		if req.PaymentStatus != "" && strings.ToLower(order.PaymentStatus) != strings.ToLower(req.PaymentStatus) {
			continue
		}
		// Filter by user_id
		if req.UserID > 0 && order.UserID != req.UserID {
			continue
		}
		// Filter by search (order number) - case-insensitive partial match
		if req.Search != "" {
			searchLower := strings.ToLower(req.Search)
			orderNumberLower := strings.ToLower(order.OrderNumber)
			if !strings.Contains(orderNumberLower, searchLower) {
				continue
			}
		}
		filteredOrders = append(filteredOrders, order)
	}

	// Get total count of filtered orders
	total := int64(len(filteredOrders))
	
	// Apply pagination to filtered results
	limit := req.Limit
	offset := (req.Page - 1) * limit
	start := offset
	end := offset + limit
	if start > len(filteredOrders) {
		start = len(filteredOrders)
	}
	if end > len(filteredOrders) {
		end = len(filteredOrders)
	}
	
	// Get paginated slice
	var paginatedOrders []*models.Order
	if start < len(filteredOrders) {
		paginatedOrders = filteredOrders[start:end]
	}

	// Convert to response DTOs
	var orderResponses []dto.AdminOrderDetailResponse
	for _, order := range paginatedOrders {
		// Convert order items
		var items []dto.OrderItemResponse
		for _, item := range order.OrderItems {
			// Get primary product image
			imageURL := ""
			for _, img := range item.Product.Images {
				if img.IsPrimary {
					imageURL = img.URL
					break
				}
			}
			// Fallback to first image if no primary
			if imageURL == "" && len(item.Product.Images) > 0 {
				imageURL = item.Product.Images[0].URL
			}

			items = append(items, dto.OrderItemResponse{
				ResourceID: item.ResourceID,
				Product: dto.ProductSummaryResponse{
					ResourceID: item.Product.ResourceID,
					Name:       item.Product.Name,
					SKU:        item.Product.SKU,
					Price:      item.Price,
					Image:      imageURL,
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
			Email:     order.User.Email,
		}

		// Convert payments
		var payments []dto.PaymentResponse
		for _, payment := range order.Payments {
			// Use Status field directly - it should be mapped to payment_status column
			paymentStatus := payment.Status
			if paymentStatus == "" {
				paymentStatus = "pending"
			}
			
			payments = append(payments, dto.PaymentResponse{
				ResourceID:    payment.ResourceID,
				Method:        payment.Method,
				Amount:        payment.Amount,
				Currency:      payment.Currency,
				Status:        paymentStatus,
				TransactionID: payment.TransactionID,
				ProcessedAt:   payment.ProcessedAt,
				CreatedAt:    payment.CreatedAt,
			})
		}

		// Calculate order payment status from payments array (takes precedence over order.payment_status)
		calculatedPaymentStatus := calculateOrderPaymentStatus(order.Payments)
		// Fallback to order.PaymentStatus if no payments exist
		if calculatedPaymentStatus == "pending" && len(order.Payments) == 0 {
			calculatedPaymentStatus = getPaymentStatus(order.PaymentStatus)
		}

		orderResponses = append(orderResponses, dto.AdminOrderDetailResponse{
			OrderResponse: dto.OrderResponse{
				ResourceID:     order.ResourceID,
				OrderNumber:    order.OrderNumber,
				UserID:         order.UserID,
				Status:         order.Status,
				PaymentStatus:  calculatedPaymentStatus,
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
			Payments: payments,
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
		// Get primary product image
		imageURL := ""
		for _, img := range item.Product.Images {
			if img.IsPrimary {
				imageURL = img.URL
				break
			}
		}
		// Fallback to first image if no primary
		if imageURL == "" && len(item.Product.Images) > 0 {
			imageURL = item.Product.Images[0].URL
		}

		items = append(items, dto.OrderItemResponse{
			ResourceID: item.ResourceID,
			Product: dto.ProductSummaryResponse{
				ResourceID: item.Product.ResourceID,
				Name:       item.Product.Name,
				SKU:        item.Product.SKU,
				Price:      item.Price,
				Image:      imageURL,
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
		Email:     updatedOrder.User.Email,
	}

	// Convert payments
	var payments []dto.PaymentResponse
	for _, payment := range updatedOrder.Payments {
		// Ensure Status is read from database column payment_status
		paymentStatus := payment.Status
		if paymentStatus == "" {
			paymentStatus = "pending"
		}
		
		payments = append(payments, dto.PaymentResponse{
			ResourceID:    payment.ResourceID,
			Method:        payment.Method,
			Amount:        payment.Amount,
			Currency:      payment.Currency,
			Status:        paymentStatus,
			TransactionID: payment.TransactionID,
			ProcessedAt:   payment.ProcessedAt,
			CreatedAt:    payment.CreatedAt,
		})
	}

	// Calculate order payment status from payments array (takes precedence over order.payment_status)
	calculatedPaymentStatus := calculateOrderPaymentStatus(updatedOrder.Payments)
	// Fallback to order.PaymentStatus if no payments exist
	if calculatedPaymentStatus == "pending" && len(updatedOrder.Payments) == 0 {
		calculatedPaymentStatus = getPaymentStatus(updatedOrder.PaymentStatus)
	}

	c.JSON(http.StatusOK, dto.AdminOrderDetailResponse{
		OrderResponse: dto.OrderResponse{
			ResourceID:     updatedOrder.ResourceID,
			OrderNumber:    updatedOrder.OrderNumber,
			UserID:         updatedOrder.UserID,
			Status:         updatedOrder.Status,
			PaymentStatus:  calculatedPaymentStatus,
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
		Payments: payments,
	})
}

