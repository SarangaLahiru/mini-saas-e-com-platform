package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Product struct {
	ID                uint           `gorm:"primaryKey" json:"id"`
	ResourceID        string         `gorm:"uniqueIndex;type:char(36);not null" json:"resource_id"`
	Name              string         `gorm:"size:255;not null" json:"name"`
	Slug              string         `gorm:"size:255;uniqueIndex;not null" json:"slug"`
	Description       string         `gorm:"type:text" json:"description"`
	ShortDescription  string         `gorm:"column:short_description;type:text" json:"short_description"`
	SKU               string         `gorm:"uniqueIndex;size:100" json:"sku"`
	BrandID           *uint          `json:"brand_id"`
	Price             float64        `gorm:"type:decimal(10,2);not null" json:"price"`
	ComparePrice      float64        `gorm:"column:compare_price;type:decimal(10,2)" json:"compare_price"`
	CostPrice         float64        `gorm:"column:cost_price;type:decimal(10,2)" json:"cost_price"`
	StockQuantity     int            `gorm:"column:stock_quantity;default:0" json:"stock_quantity"`
	LowStockThreshold int            `gorm:"column:low_stock_threshold;default:5" json:"low_stock_threshold"`
	TrackQuantity     bool           `gorm:"column:track_quantity;default:true" json:"track_quantity"`
	AllowBackorder    bool           `gorm:"column:allow_backorder;default:false" json:"allow_backorder"`
	Weight            float64        `gorm:"type:decimal(8,2)" json:"weight"`
	Length            float64        `gorm:"type:decimal(8,2)" json:"length"`
	Width             float64        `gorm:"type:decimal(8,2)" json:"width"`
	Height            float64        `gorm:"type:decimal(8,2)" json:"height"`
	IsActive          bool           `gorm:"column:is_active;default:true" json:"is_active"`
	IsFeatured        bool           `gorm:"column:is_featured;default:false" json:"is_featured"`
	IsDigital         bool           `gorm:"column:is_digital;default:false" json:"is_digital"`
	RequiresShipping  bool           `gorm:"column:requires_shipping;default:true" json:"requires_shipping"`
	Taxable           bool           `gorm:"default:true" json:"taxable"`
	MetaTitle         string         `gorm:"column:meta_title;size:255" json:"meta_title"`
	MetaDescription   string         `gorm:"column:meta_description;type:text" json:"meta_description"`
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`
	DeletedAt         gorm.DeletedAt `gorm:"index" json:"-"`

	// Computed/Virtual fields (not in DB)
	Stock      int    `gorm:"-" json:"stock"` // Alias for StockQuantity
	MinStock   int    `gorm:"-" json:"min_stock"` // Alias for LowStockThreshold
	Dimensions string `gorm:"-" json:"dimensions"`
	Brand      string `gorm:"-" json:"brand"`
	Model      string `gorm:"-" json:"model"`
	Status     string `gorm:"-" json:"status"`
	CategoryID uint   `gorm:"-" json:"category_id"`

	// Relationships
	Category   Category   `gorm:"-" json:"category,omitempty"`
	Categories []Category `gorm:"many2many:product_categories" json:"-"`
	Images     []Image    `gorm:"foreignKey:ProductID" json:"images,omitempty"`
	Variants   []Variant  `gorm:"foreignKey:ProductID" json:"variants,omitempty"`
	Reviews    []Review   `gorm:"foreignKey:ProductID" json:"reviews,omitempty"`
	BrandRef   *Brand     `gorm:"foreignKey:ID;references:BrandID" json:"brand_ref,omitempty"`
}

type Brand struct {
    ID        uint      `gorm:"primaryKey" json:"id"`
    Name      string    `gorm:"size:150;uniqueIndex" json:"name"`
    Slug      string    `gorm:"size:150;uniqueIndex" json:"slug"`
    IsActive  bool      `gorm:"default:true" json:"is_active"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}

type Image struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	ResourceID string    `gorm:"uniqueIndex;type:char(36);not null" json:"resource_id"`
	ProductID  uint      `gorm:"not null" json:"product_id"`
	URL        string    `gorm:"size:500;not null" json:"url"`
	Alt        string    `gorm:"column:alt_text;size:200" json:"alt"`
	SortOrder  int       `gorm:"column:sort_order;default:0" json:"sort_order"`
	IsPrimary  bool      `gorm:"column:is_primary;default:false" json:"is_primary"`
	CreatedAt  time.Time `gorm:"default:CURRENT_TIMESTAMP" json:"created_at"`

	// Relationships
	Product Product `gorm:"foreignKey:ProductID" json:"product,omitempty"`
}

type Variant struct {
	ID            uint    `gorm:"primaryKey" json:"id"`
	ResourceID    string  `gorm:"uniqueIndex;type:char(36);not null" json:"resource_id"`
	ProductID     uint    `gorm:"not null" json:"product_id"`
	Name          string  `gorm:"size:255;not null" json:"name"`
	SKU           string  `gorm:"size:100;uniqueIndex" json:"sku"`
	Price         float64 `gorm:"type:decimal(10,2)" json:"price"`
	ComparePrice  float64 `gorm:"column:compare_price;type:decimal(10,2)" json:"compare_price"`
	CostPrice     float64 `gorm:"column:cost_price;type:decimal(10,2)" json:"cost_price"`
	StockQuantity int     `gorm:"column:stock_quantity;default:0" json:"stock_quantity"`
	Weight        float64 `gorm:"type:decimal(8,2)" json:"weight"`
	IsActive      bool    `gorm:"column:is_active;default:true" json:"is_active"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`

	// Relationships
	Product Product `gorm:"foreignKey:ProductID" json:"product,omitempty"`
}

type Review struct {
	ID                 uint      `gorm:"primaryKey" json:"id"`
	ResourceID         string    `gorm:"uniqueIndex;type:char(36);not null" json:"resource_id"`
	ProductID          uint      `gorm:"not null" json:"product_id"`
	UserID             uint      `gorm:"not null" json:"user_id"`
	Rating             int       `gorm:"not null;check:rating >= 1 AND rating <= 5" json:"rating"`
	Title              string    `gorm:"size:200" json:"title"`
	Comment            string    `gorm:"type:text" json:"comment"`
	IsApproved         bool      `gorm:"default:true" json:"is_approved"`
	IsVerifiedPurchase bool      `gorm:"default:false" json:"is_verified_purchase"`
	CreatedAt          time.Time `json:"created_at"`
	UpdatedAt          time.Time `json:"updated_at"`

	// Relationships
	Product Product        `gorm:"foreignKey:ProductID" json:"product,omitempty"`
	User    User           `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Replies []ReviewReply  `gorm:"foreignKey:ReviewID" json:"replies,omitempty"`
}

// ReviewReply represents a reply to a review
type ReviewReply struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	ResourceID string    `gorm:"uniqueIndex;type:char(36);not null" json:"resource_id"`
	ReviewID   uint      `gorm:"not null" json:"review_id"`
	UserID     uint      `gorm:"not null" json:"user_id"`
	Comment    string    `gorm:"type:text;not null" json:"comment"`
	IsApproved bool      `gorm:"default:true" json:"is_approved"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`

	// Relationships
	Review Review `gorm:"foreignKey:ReviewID" json:"review,omitempty"`
	User   User   `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

// TableName specifies the table name for ReviewReply model
func (ReviewReply) TableName() string {
	return "review_replies"
}

func (p *Product) BeforeCreate(tx *gorm.DB) error {
	if p.ResourceID == "" {
		p.ResourceID = uuid.New().String()
	}
	// Set computed fields
	p.setComputedFields()
	return nil
}

func (p *Product) AfterFind(tx *gorm.DB) error {
	// Set computed fields after loading from database
	p.setComputedFields()
	return nil
}

// setComputedFields sets the computed/virtual fields based on database fields
func (p *Product) setComputedFields() {
	p.Stock = p.StockQuantity
	p.MinStock = p.LowStockThreshold
	
	// Set status based on is_active
	if p.IsActive {
		p.Status = "active"
	} else {
		p.Status = "inactive"
	}
	
	// Set brand name if BrandRef is loaded
	if p.BrandRef != nil {
		p.Brand = p.BrandRef.Name
	}
	
	// Set category ID if Categories are loaded
	if len(p.Categories) > 0 {
		p.CategoryID = p.Categories[0].ID
		p.Category = p.Categories[0]
	}
}

func (i *Image) BeforeCreate(tx *gorm.DB) error {
	if i.ResourceID == "" {
		i.ResourceID = uuid.New().String()
	}
	return nil
}

func (v *Variant) BeforeCreate(tx *gorm.DB) error {
	if v.ResourceID == "" {
		v.ResourceID = uuid.New().String()
	}
	return nil
}

func (r *Review) BeforeCreate(tx *gorm.DB) error {
	if r.ResourceID == "" {
		r.ResourceID = uuid.New().String()
	}
	return nil
}