package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Cart struct {
	ID         uint      `gorm:"primaryKey"`
	ResourceID string    `gorm:"unique"`
	UserID     uint      `gorm:"index"`
	CreatedAt  time.Time
	UpdatedAt  time.Time
	Items      []CartItem `gorm:"foreignKey:CartID"`
}

// TableName specifies the table name for Cart model
func (Cart) TableName() string {
	return "cart"
}

type CartItem struct {
	ID         uint      `gorm:"primaryKey"`
	ResourceID string    `gorm:"unique"`
	CartID     uint      `gorm:"index"`
	ProductID  uint
	VariantID  *uint
	Quantity   int
	CreatedAt  time.Time
	UpdatedAt  time.Time
	Product    Product   `gorm:"foreignkey:ProductID"`
	Variant    *Variant  `gorm:"foreignkey:VariantID"`
}

type Wishlist struct {
	ID        uint   `gorm:"primaryKey" json:"id"`
	ResourceID string `gorm:"uniqueIndex;type:char(36);not null" json:"resource_id"`
	UserID    uint   `gorm:"not null" json:"user_id"`
	ProductID uint   `gorm:"not null" json:"product_id"`
	CreatedAt time.Time `json:"created_at"`

	// Relationships
	User    User    `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Product Product `gorm:"foreignKey:ProductID" json:"product,omitempty"`
}

// TableName specifies the table name for Wishlist model
func (Wishlist) TableName() string {
	return "wishlist"
}

type Discount struct {
	ID             uint       `gorm:"primaryKey" json:"id"`
	ResourceID     string     `gorm:"uniqueIndex;type:char(36);not null" json:"resource_id"`
	Name           string     `gorm:"size:100;not null" json:"name"`
	Code           string     `gorm:"uniqueIndex;size:50" json:"code"`
	Type           string     `gorm:"size:20;not null" json:"type"` // percentage, fixed_amount, free_shipping
	Value          float64    `gorm:"type:decimal(10,2);not null" json:"value"`
	MinimumAmount  float64    `gorm:"type:decimal(10,2);default:0" json:"minimum_amount"`
	MaximumDiscount *float64  `gorm:"type:decimal(10,2)" json:"maximum_discount"`
	UsageLimit     *int       `json:"usage_limit"`
	UsedCount      int        `gorm:"default:0" json:"used_count"`
	IsActive       bool       `gorm:"default:true" json:"is_active"`
	StartsAt       *time.Time `json:"starts_at"`
	ExpiresAt      *time.Time `json:"expires_at"`
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`
}

type Promotion struct {
	ID        uint       `gorm:"primaryKey" json:"id"`
	ResourceID string    `gorm:"uniqueIndex;type:char(36);not null" json:"resource_id"`
	Title     string     `gorm:"size:200;not null" json:"title"`
	Description string   `gorm:"type:text" json:"description"`
	Image     string     `gorm:"size:500" json:"image"`
	Type      string     `gorm:"size:20;not null" json:"type"` // banner, popup, sidebar
	Position  string     `gorm:"size:20;not null" json:"position"` // top, bottom, left, right, center
	IsActive  bool       `gorm:"default:true" json:"is_active"`
	StartsAt  *time.Time `json:"starts_at"`
	ExpiresAt *time.Time `json:"expires_at"`
	CreatedAt time.Time  `json:"created_at"`
	UpdatedAt time.Time  `json:"updated_at"`
}

func (c *Cart) BeforeCreate(tx *gorm.DB) error {
	if c.ResourceID == "" {
		c.ResourceID = uuid.New().String()
	}
	return nil
}

func (ci *CartItem) BeforeCreate(tx *gorm.DB) error {
	if ci.ResourceID == "" {
		ci.ResourceID = uuid.New().String()
	}
	return nil
}

func (w *Wishlist) BeforeCreate(tx *gorm.DB) error {
	if w.ResourceID == "" {
		w.ResourceID = uuid.New().String()
	}
	return nil
}

func (d *Discount) BeforeCreate(tx *gorm.DB) error {
	if d.ResourceID == "" {
		d.ResourceID = uuid.New().String()
	}
	return nil
}

func (p *Promotion) BeforeCreate(tx *gorm.DB) error {
	if p.ResourceID == "" {
		p.ResourceID = uuid.New().String()
	}
	return nil
}
