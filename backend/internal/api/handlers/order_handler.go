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
	orderUsecase   usecase.OrderUsecase
	productUsecase usecase.ProductUsecase
}

func NewOrderHandler(orderUsecase usecase.OrderUsecase, productUsecase usecase.ProductUsecase) *OrderHandler {
	return &OrderHandler{
		orderUsecase:   orderUsecase,
		productUsecase: productUsecase,
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
	status := c.Query("status")
	paymentStatus := c.Query("payment_status")
	dateFrom := c.Query("date_from")
	dateTo := c.Query("date_to")

	if page <= 0 {
		page = 1
	}
	if limit <= 0 {
		limit = 10
	}
	if limit > 100 {
		limit = 100
	}

	// Build filters map
	filters := make(map[string]interface{})
	if status != "" {
		filters["status"] = status
	}
	if paymentStatus != "" {
		filters["payment_status"] = paymentStatus
	}
	if dateFrom != "" {
		filters["date_from"] = dateFrom
	}
	if dateTo != "" {
		filters["date_to"] = dateTo
	}

	orders, total, err := h.orderUsecase.List(c.Request.Context(), userID.(uint), page, limit, filters)
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
		// Count order items
		itemCount := len(order.OrderItems)
		
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
			ItemCount:      itemCount,
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

	// Convert order items
	var items []dto.OrderItemResponse
	for _, item := range order.OrderItems {
		// Get primary product image
		imageURL := ""
		if len(item.Product.Images) > 0 {
			for _, img := range item.Product.Images {
				if img.IsPrimary {
					imageURL = img.URL
					break
				}
			}
			// Fallback to first image if no primary
			if imageURL == "" {
				imageURL = item.Product.Images[0].URL
			}
		}

		// Use order item price, fallback to product price if order item price is 0
		itemPrice := item.Price
		if itemPrice == 0 && item.Product.Price > 0 {
			itemPrice = item.Product.Price
		}

		// Calculate total if missing or zero
		itemTotal := item.Total
		if itemTotal == 0 && itemPrice > 0 {
			itemTotal = itemPrice * float64(item.Quantity)
		}

		items = append(items, dto.OrderItemResponse{
			ResourceID: item.ResourceID,
			Product: dto.ProductSummaryResponse{
				ResourceID: item.Product.ResourceID,
				Name:       item.Product.Name,
				SKU:        item.Product.SKU,
				Price:      itemPrice, // Use calculated price for display
				Image:      imageURL,
			},
			Quantity: item.Quantity,
			Price:    itemPrice, // Use calculated price
			Total:    itemTotal, // Use calculated total
		})
	}

	c.JSON(http.StatusOK, dto.OrderDetailResponse{
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
			CreatedAt:      order.CreatedAt.Format("2006-01-02T15:04:05Z"),
			UpdatedAt:      order.UpdatedAt.Format("2006-01-02T15:04:05Z"),
		},
		OrderItems: items,
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

	// Validate and fetch products for order items
	orderItems := make([]models.OrderItem, 0, len(req.Items))
	for _, itemReq := range req.Items {
		// Get product by resource ID
		product, err := h.productUsecase.GetByResourceID(c.Request.Context(), itemReq.ProductResourceID)
		if err != nil {
			c.JSON(http.StatusBadRequest, dto.ErrorResponse{
				Error:   "Invalid product",
				Message: "Product not found: " + itemReq.ProductResourceID,
			})
			return
		}
		if product == nil {
			c.JSON(http.StatusBadRequest, dto.ErrorResponse{
				Error:   "Invalid product",
				Message: "Product not found: " + itemReq.ProductResourceID,
			})
			return
		}

		// Create order item
		orderItem := models.OrderItem{
			ProductID: product.ID,
			Quantity:  itemReq.Quantity,
			Price:     itemReq.Price,
			Total:     itemReq.Price * float64(itemReq.Quantity),
		}

		// Handle variant if provided
		if itemReq.VariantResourceID != nil && *itemReq.VariantResourceID != "" {
			// Find variant in product by resource_id
			var variant *models.Variant
			for i := range product.Variants {
				if product.Variants[i].ResourceID == *itemReq.VariantResourceID {
					variant = &product.Variants[i]
					break
				}
			}
			if variant != nil {
				variantID := variant.ID
				orderItem.VariantID = &variantID
			}
		}

		orderItems = append(orderItems, orderItem)
	}

	// Create order with items
	order := &models.Order{
		UserID:         userID.(uint),
		Status:         "pending",
		PaymentStatus:  "pending",
		Subtotal:       req.Subtotal,
		TaxAmount:      req.TaxAmount,
		ShippingCost:   req.ShippingCost,
		DiscountAmount: req.DiscountAmount,
		Total:          req.Total,
		Currency:       req.Currency,
		Notes:          req.Notes,
		OrderItems:     orderItems,
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
		ShippingCost: order.ShippingCost,
		DiscountAmount: order.DiscountAmount,
		Total:          order.Total,
		Currency:       order.Currency,
		Notes:          order.Notes,
		CreatedAt:      order.CreatedAt.Format("2006-01-02T15:04:05Z"),
		UpdatedAt:      order.UpdatedAt.Format("2006-01-02T15:04:05Z"),
		ItemCount:      len(order.OrderItems),
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