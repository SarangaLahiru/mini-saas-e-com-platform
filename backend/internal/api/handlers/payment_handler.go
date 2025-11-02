package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"time"

	"electronics-store/internal/dto"
	"electronics-store/internal/usecase"

	"github.com/gin-gonic/gin"
)

type PaymentHandler struct {
	paymentUsecase usecase.PaymentUsecase
}

func NewPaymentHandler(paymentUsecase usecase.PaymentUsecase) *PaymentHandler {
	return &PaymentHandler{
		paymentUsecase: paymentUsecase,
	}
}

// CreatePayment godoc
// @Summary Create payment
// @Description Create a payment for an order
// @Tags payments
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body dto.CreatePaymentRequest true "Create payment request"
// @Success 201 {object} dto.PaymentResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Router /payments [post]
func (h *PaymentHandler) CreatePayment(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error:   "Unauthorized",
			Message: "User not authenticated",
		})
		return
	}

	var req dto.CreatePaymentRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: err.Error(),
		})
		return
	}

	// Generate transaction ID if not provided
	if req.TransactionID == "" {
		req.TransactionID = "txn_" + time.Now().Format("20060102150405") + "_" + generateRandomString(8)
	}

	// Create payment
	paymentReq := usecase.PaymentRequest{
		Method:          req.Method,
		Amount:          req.Amount,
		Currency:        req.Currency,
		TransactionID:   req.TransactionID,
		GatewayResponse: req.GatewayResponse,
	}

	payment, err := h.paymentUsecase.CreatePayment(c.Request.Context(), req.OrderResourceID, userID.(uint), paymentReq)
	if err != nil {
		if err == usecase.ErrInvalidOrder || err.Error() == "invalid order" {
			c.JSON(http.StatusNotFound, dto.ErrorResponse{
				Error:   "Order not found",
				Message: err.Error(),
			})
			return
		}
		if err.Error() == "unauthorized: order does not belong to user" {
			c.JSON(http.StatusForbidden, dto.ErrorResponse{
				Error:   "Forbidden",
				Message: err.Error(),
			})
			return
		}
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to create payment",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusCreated, dto.PaymentResponse{
		ResourceID:    payment.ResourceID,
		Method:        payment.Method,
		Amount:        payment.Amount,
		Currency:      payment.Currency,
		Status:        payment.Status,
		TransactionID: payment.TransactionID,
		ProcessedAt:   payment.ProcessedAt,
		CreatedAt:     payment.CreatedAt,
	})
}

// Helper function to generate random string
func generateRandomString(length int) string {
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		// Fallback to timestamp-based if crypto/rand fails
		return hex.EncodeToString([]byte(time.Now().String()))[:length]
	}
	return hex.EncodeToString(bytes)[:length]
}

