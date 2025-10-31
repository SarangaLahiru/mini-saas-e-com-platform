package dto

import (
	"time"
)

// Cart DTOs
type CartResponse struct {
	ResourceID string         `json:"resource_id"`
	UserID     *uint          `json:"user_id"`
	SessionID  string         `json:"session_id"`
	Items      []CartItemResponse `json:"items,omitempty"`
	TotalItems int            `json:"total_items"`
	Subtotal   float64        `json:"subtotal"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
}

type CartItemResponse struct {
    ID        uint   `json:"id"`
    ProductID uint   `json:"product_id"`
    VariantID *uint  `json:"variant_id,omitempty"`
    Quantity  int    `json:"quantity"`
    Price     int    `json:"price"`
    // Product and Variant short info option here...
}

type AddToCartRequest struct {
    ProductID   *uint   `json:"product_id,omitempty"`
    ProductResourceID *string `json:"product_resource_id,omitempty"`
    VariantID   *uint   `json:"variant_id,omitempty"`
    Quantity    int     `json:"quantity"`
}

type UpdateCartItemRequest struct {
    Quantity int   `json:"quantity"`
}

type CartSummaryResponse struct {
	TotalItems    int     `json:"total_items"`
	Subtotal      float64 `json:"subtotal"`
	TaxAmount     float64 `json:"tax_amount"`
	ShippingCost  float64 `json:"shipping_cost"`
	DiscountAmount float64 `json:"discount_amount"`
	Total         float64 `json:"total"`
}

// Wishlist DTOs
type WishlistResponse struct {
	ResourceID string          `json:"resource_id"`
	UserID     uint            `json:"user_id"`
	ProductID  uint            `json:"product_id"`
	Product    ProductResponse `json:"product,omitempty"`
	CreatedAt  time.Time       `json:"created_at"`
}

type AddToWishlistRequest struct {
	ProductID uint `json:"product_id" validate:"required"`
}

// Discount DTOs
type DiscountResponse struct {
	ResourceID      string     `json:"resource_id"`
	Name            string     `json:"name"`
	Code            string     `json:"code"`
	Type            string     `json:"type"`
	Value           float64    `json:"value"`
	MinimumAmount   float64    `json:"minimum_amount"`
	MaximumDiscount *float64   `json:"maximum_discount"`
	UsageLimit      *int       `json:"usage_limit"`
	UsedCount       int        `json:"used_count"`
	IsActive        bool       `json:"is_active"`
	StartsAt        *time.Time `json:"starts_at"`
	ExpiresAt       *time.Time `json:"expires_at"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

type CreateDiscountRequest struct {
	Name            string     `json:"name" validate:"required,min=1,max=100"`
	Code            string     `json:"code" validate:"max=50"`
	Type            string     `json:"type" validate:"required,oneof=percentage fixed_amount free_shipping"`
	Value           float64    `json:"value" validate:"required,min=0"`
	MinimumAmount   float64    `json:"minimum_amount" validate:"min=0"`
	MaximumDiscount *float64   `json:"maximum_discount" validate:"omitempty,min=0"`
	UsageLimit      *int       `json:"usage_limit" validate:"omitempty,min=1"`
	IsActive        bool       `json:"is_active"`
	StartsAt        *time.Time `json:"starts_at"`
	ExpiresAt       *time.Time `json:"expires_at"`
}

type UpdateDiscountRequest struct {
	Name            *string    `json:"name" validate:"omitempty,min=1,max=100"`
	Code            *string    `json:"code" validate:"omitempty,max=50"`
	Type            *string    `json:"type" validate:"omitempty,oneof=percentage fixed_amount free_shipping"`
	Value           *float64   `json:"value" validate:"omitempty,min=0"`
	MinimumAmount   *float64   `json:"minimum_amount" validate:"omitempty,min=0"`
	MaximumDiscount *float64   `json:"maximum_discount" validate:"omitempty,min=0"`
	UsageLimit      *int       `json:"usage_limit" validate:"omitempty,min=1"`
	IsActive        *bool      `json:"is_active"`
	StartsAt        *time.Time `json:"starts_at"`
	ExpiresAt       *time.Time `json:"expires_at"`
}

// Promotion DTOs
type PromotionResponse struct {
	ResourceID  string     `json:"resource_id"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	Image       string     `json:"image"`
	Type        string     `json:"type"`
	Position    string     `json:"position"`
	IsActive    bool       `json:"is_active"`
	StartsAt    *time.Time `json:"starts_at"`
	ExpiresAt   *time.Time `json:"expires_at"`
	CreatedAt   time.Time  `json:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at"`
}

type CreatePromotionRequest struct {
	Title       string     `json:"title" validate:"required,min=1,max=200"`
	Description string     `json:"description"`
	Image       string     `json:"image" validate:"max=500"`
	Type        string     `json:"type" validate:"required,oneof=banner popup sidebar"`
	Position    string     `json:"position" validate:"required,oneof=top bottom left right center"`
	IsActive    bool       `json:"is_active"`
	StartsAt    *time.Time `json:"starts_at"`
	ExpiresAt   *time.Time `json:"expires_at"`
}

type UpdatePromotionRequest struct {
	Title       *string    `json:"title" validate:"omitempty,min=1,max=200"`
	Description *string    `json:"description"`
	Image       *string    `json:"image" validate:"omitempty,max=500"`
	Type        *string    `json:"type" validate:"omitempty,oneof=banner popup sidebar"`
	Position    *string    `json:"position" validate:"omitempty,oneof=top bottom left right center"`
	IsActive    *bool      `json:"is_active"`
	StartsAt    *time.Time `json:"starts_at"`
	ExpiresAt   *time.Time `json:"expires_at"`
}
