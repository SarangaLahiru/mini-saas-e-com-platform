package dto

import (
	"errors"
	"time"
)

// Order DTOs

type CreateOrderRequest struct {
	Subtotal       float64 `json:"subtotal" binding:"required,min=0"`
	TaxAmount      float64 `json:"tax_amount" binding:"min=0"`
	ShippingCost   float64 `json:"shipping_cost" binding:"min=0"`
	DiscountAmount float64 `json:"discount_amount" binding:"min=0"`
	Total          float64 `json:"total" binding:"required,min=0"`
	Currency       string  `json:"currency" binding:"required,len=3"`
	Notes          string  `json:"notes" binding:"omitempty,max=500"`
}

func (c *CreateOrderRequest) Validate() error {
	// Validate currency
	if len(c.Currency) != 3 {
		return errors.New("currency must be 3 characters")
	}

	// Validate notes length
	if len(c.Notes) > 500 {
		return errors.New("notes must be less than 500 characters")
	}

	return nil
}

type UpdateOrderRequest struct {
	Status        *string `json:"status" binding:"omitempty,oneof=pending confirmed shipped delivered cancelled"`
	PaymentStatus *string `json:"payment_status" binding:"omitempty,oneof=pending paid failed refunded"`
	Notes         *string `json:"notes" binding:"omitempty,max=500"`
}

type ProcessPaymentRequest struct {
	Method         string `json:"method" binding:"required,oneof=stripe paypal bank_transfer"`
	PaymentToken   string `json:"payment_token" binding:"required"`
	ReturnURL      string `json:"return_url" binding:"omitempty,url"`
	CancelURL      string `json:"cancel_url" binding:"omitempty,url"`
}

func (p *ProcessPaymentRequest) Validate() error {
	// Validate payment method
	validMethods := []string{"stripe", "paypal", "bank_transfer"}
	if !contains(validMethods, p.Method) {
		return errors.New("invalid payment method")
	}

	// Validate URLs if provided
	if p.ReturnURL != "" && !isValidURL(p.ReturnURL) {
		return errors.New("return URL must be valid")
	}

	if p.CancelURL != "" && !isValidURL(p.CancelURL) {
		return errors.New("cancel URL must be valid")
	}

	return nil
}

type OrderResponse struct {
	ResourceID     string    `json:"resource_id"`
	OrderNumber    string    `json:"order_number"`
	UserID         uint      `json:"user_id"`
	Status         string    `json:"status"`
	PaymentStatus  string    `json:"payment_status"`
	Subtotal       float64   `json:"subtotal"`
	TaxAmount      float64   `json:"tax_amount"`
	ShippingCost   float64   `json:"shipping_cost"`
	DiscountAmount float64   `json:"discount_amount"`
	Total          float64   `json:"total"`
	Currency       string    `json:"currency"`
	Notes          string    `json:"notes"`
	ShippedAt      *string   `json:"shipped_at"`
	DeliveredAt    *string   `json:"delivered_at"`
	CreatedAt      string    `json:"created_at"`
	UpdatedAt      string    `json:"updated_at"`
}

type OrderDetailResponse struct {
	OrderResponse
	OrderItems []OrderItemResponse `json:"order_items"`
}

type OrderItemResponse struct {
	ResourceID string                    `json:"resource_id"`
	Product    ProductSummaryResponse    `json:"product"`
	Variant    *VariantResponse          `json:"variant,omitempty"`
	Quantity   int                       `json:"quantity"`
	Price      float64                   `json:"price"`
	Total      float64                   `json:"total"`
}

type ProductSummaryResponse struct {
	ResourceID string  `json:"resource_id"`
	Name       string  `json:"name"`
	SKU        string  `json:"sku"`
	Price      float64 `json:"price"`
	Image      string  `json:"image,omitempty"` // Primary product image URL
}


type OrderListResponse struct {
	Orders []OrderResponse `json:"orders"`
	Total  int64           `json:"total"`
	Page   int             `json:"page"`
	Limit  int             `json:"limit"`
}

type PaymentResponse struct {
	ResourceID    string     `json:"resource_id"`
	Method        string     `json:"method"`
	Amount        float64    `json:"amount"`
	Currency      string     `json:"currency"`
	Status        string     `json:"status"`
	TransactionID string     `json:"transaction_id"`
	ProcessedAt   *time.Time `json:"processed_at"`
	CreatedAt     time.Time  `json:"created_at"`
}


// Pagination DTOs

type PaginationResponse struct {
	Page       int `json:"page"`
	Limit      int `json:"limit"`
	Total      int `json:"total"`
	TotalPages int `json:"total_pages"`
}

// Helper functions

func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

