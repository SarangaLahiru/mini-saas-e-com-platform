package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Order struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	ResourceID    string    `gorm:"uniqueIndex;type:char(36);not null" json:"resource_id"`
	OrderNumber   string    `gorm:"uniqueIndex;size:20;not null" json:"order_number"`
	UserID        uint      `gorm:"not null" json:"user_id"`
	Status        string    `gorm:"size:20;default:pending" json:"status"`
	PaymentStatus string    `gorm:"size:20;default:pending;column:payment_status" json:"payment_status"`
	Subtotal      float64   `gorm:"type:decimal(10,2);not null;column:subtotal" json:"subtotal"`
	TaxAmount     float64   `gorm:"type:decimal(10,2);default:0;column:tax_amount" json:"tax_amount"`
	ShippingCost  float64   `gorm:"type:decimal(10,2);default:0;column:shipping_amount" json:"shipping_cost"`
	DiscountAmount float64  `gorm:"type:decimal(10,2);default:0;column:discount_amount" json:"discount_amount"`
	Total         float64   `gorm:"type:decimal(10,2);not null;column:total_amount" json:"total"`
	Currency      string    `gorm:"size:3;default:USD" json:"currency"`
	Notes         string    `gorm:"type:text" json:"notes"`
	ShippedAt     *time.Time `json:"shipped_at"`
	DeliveredAt   *time.Time `json:"delivered_at"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`

	// Relationships
	User       User        `gorm:"foreignKey:UserID" json:"user,omitempty"`
	OrderItems []OrderItem `gorm:"foreignKey:OrderID" json:"order_items,omitempty"`
	Payments   []Payment   `gorm:"foreignKey:OrderID" json:"payments,omitempty"`
}

type OrderItem struct {
	ID         uint    `gorm:"primaryKey" json:"id"`
	ResourceID string  `gorm:"uniqueIndex;type:char(36);not null" json:"resource_id"`
	OrderID    uint    `gorm:"not null" json:"order_id"`
	ProductID  uint    `gorm:"not null" json:"product_id"`
	VariantID  *uint   `gorm:"index" json:"variant_id"`
	Quantity   int     `gorm:"not null" json:"quantity"`
	Price      float64 `gorm:"type:decimal(10,2);not null;column:unit_price" json:"price"`
	Total      float64 `gorm:"type:decimal(10,2);not null;column:total_price" json:"total"`
	CreatedAt  time.Time `json:"created_at"`

	// Relationships
	Order   Order   `gorm:"foreignKey:OrderID" json:"order,omitempty"`
	Product Product `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	Variant *Variant `gorm:"foreignKey:VariantID" json:"variant,omitempty"`
}

type Payment struct {
	ID              uint       `gorm:"primaryKey" json:"id"`
	ResourceID      string     `gorm:"uniqueIndex;type:char(36);not null" json:"resource_id"`
	OrderID         uint       `gorm:"not null" json:"order_id"`
	Method          string     `gorm:"size:20;not null;column:payment_method" json:"method"`
	Amount          float64    `gorm:"type:decimal(10,2);not null" json:"amount"`
	Currency        string     `gorm:"size:3;default:USD" json:"currency"`
	Status          string     `gorm:"column:payment_status" json:"status"`
	TransactionID   string     `gorm:"size:255" json:"transaction_id"`
	GatewayResponse string     `gorm:"type:json;column:gateway_response" json:"gateway_response"`
	ProcessedAt     *time.Time `gorm:"column:processed_at" json:"processed_at"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`

	// Relationships
	Order Order `gorm:"foreignKey:OrderID" json:"order,omitempty"`
}

// TableName specifies the table name for Payment
func (Payment) TableName() string {
	return "payments"
}

func (o *Order) BeforeCreate(tx *gorm.DB) error {
	if o.ResourceID == "" {
		o.ResourceID = uuid.New().String()
	}
	if o.OrderNumber == "" {
		o.OrderNumber = generateOrderNumber()
	}
	return nil
}

func (oi *OrderItem) BeforeCreate(tx *gorm.DB) error {
	if oi.ResourceID == "" {
		oi.ResourceID = uuid.New().String()
	}
	return nil
}

func (p *Payment) BeforeCreate(tx *gorm.DB) error {
	if p.ResourceID == "" {
		p.ResourceID = uuid.New().String()
	}
	return nil
}

func generateOrderNumber() string {
	return "ORD" + time.Now().Format("20060102") + "-" + uuid.New().String()[:8]
}