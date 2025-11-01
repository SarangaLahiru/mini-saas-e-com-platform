package dto

import (
	"time"
)

// Product DTOs
type ProductResponse struct {
	ID           uint      `json:"id"`
	ResourceID   string    `json:"resource_id"`
	Name         string    `json:"name"`
	Description  string    `json:"description"`
	SKU          string    `json:"sku"`
	Price        float64   `json:"price"`
	ComparePrice float64   `json:"compare_price"`
	Cost         float64   `json:"cost"`
	Stock        int       `json:"stock"`
	MinStock     int       `json:"min_stock"`
	Weight       float64   `json:"weight"`
	Dimensions   string    `json:"dimensions"`
	Brand        string    `json:"brand"`
	Model        string    `json:"model"`
	Status       string    `json:"status"`
	IsFeatured   bool      `json:"is_featured"`
	IsDigital    bool      `json:"is_digital"`
	CategoryID   uint      `json:"category_id"`
	Category     CategoryResponse `json:"category,omitempty"`
	Images       []ImageResponse  `json:"images,omitempty"`
	Variants     []VariantResponse `json:"variants,omitempty"`
	Reviews      []ReviewResponse  `json:"reviews,omitempty"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type CreateProductRequest struct {
	Name              string               `json:"name" validate:"required,min=1,max=200"`
	ShortDescription   string               `json:"short_description"`
	Description       string               `json:"description"`
	SKU               string               `json:"sku" validate:"required,min=1,max=100"`
	Price              float64              `json:"price" validate:"required,min=0"`
	ComparePrice      float64              `json:"compare_price" validate:"min=0"`
	CostPrice         float64              `json:"cost_price" validate:"min=0"`
	StockQuantity     int                  `json:"stock_quantity" validate:"min=0"`
	LowStockThreshold int                  `json:"low_stock_threshold" validate:"min=0"`
	Weight            float64              `json:"weight" validate:"min=0"`
	Length            float64              `json:"length" validate:"min=0"`
	Width             float64              `json:"width" validate:"min=0"`
	Height            float64              `json:"height" validate:"min=0"`
	BrandID           *uint                `json:"brand_id"`
	IsActive          bool                 `json:"is_active"`
	IsFeatured        bool                 `json:"is_featured"`
	IsDigital         bool                 `json:"is_digital"`
	RequiresShipping  bool                 `json:"requires_shipping"`
	Taxable           bool                 `json:"taxable"`
	TrackQuantity     bool                 `json:"track_quantity"`
	AllowBackorder    bool                 `json:"allow_backorder"`
	MetaTitle         string               `json:"meta_title" validate:"max=255"`
	MetaDescription   string               `json:"meta_description"`
	CategoryID        uint                 `json:"category_id" validate:"required"`
	Images            []CreateImageRequest `json:"images"`
}

type UpdateProductRequest struct {
	Name              *string              `json:"name" validate:"omitempty,min=1,max=200"`
	ShortDescription   *string              `json:"short_description"`
	Description       *string              `json:"description"`
	SKU               *string              `json:"sku" validate:"omitempty,min=1,max=100"`
	Price              *float64             `json:"price" validate:"omitempty,min=0"`
	ComparePrice      *float64             `json:"compare_price" validate:"omitempty,min=0"`
	CostPrice         *float64             `json:"cost_price" validate:"omitempty,min=0"`
	StockQuantity     *int                 `json:"stock_quantity" validate:"omitempty,min=0"`
	LowStockThreshold *int                 `json:"low_stock_threshold" validate:"omitempty,min=0"`
	Weight            *float64             `json:"weight" validate:"omitempty,min=0"`
	Length            *float64             `json:"length" validate:"omitempty,min=0"`
	Width             *float64             `json:"width" validate:"omitempty,min=0"`
	Height            *float64             `json:"height" validate:"omitempty,min=0"`
	BrandID           *uint                `json:"brand_id"`
	IsActive          *bool                `json:"is_active"`
	IsFeatured        *bool                `json:"is_featured"`
	IsDigital         *bool                `json:"is_digital"`
	RequiresShipping  *bool                `json:"requires_shipping"`
	Taxable           *bool                `json:"taxable"`
	TrackQuantity     *bool                `json:"track_quantity"`
	AllowBackorder    *bool                `json:"allow_backorder"`
	MetaTitle         *string              `json:"meta_title" validate:"omitempty,max=255"`
	MetaDescription   *string              `json:"meta_description"`
	CategoryID        *uint                `json:"category_id" validate:"omitempty"`
	Images            []CreateImageRequest `json:"images"`
}

type ProductListRequest struct {
	Page       int    `form:"page" validate:"min=1"`
	Limit      int    `form:"limit" validate:"min=1,max=100"`
	Search     string `form:"search"`
	CategoryID uint   `form:"category_id"`
	Brand      string `form:"brand"`
	MinPrice   float64 `form:"min_price" validate:"min=0"`
	MaxPrice   float64 `form:"max_price" validate:"min=0"`
	Status     string `form:"status" validate:"omitempty,oneof=active inactive draft"`
	IsFeatured *bool  `form:"is_featured"`
	SortBy     string `form:"sort_by" validate:"omitempty,oneof=name price created_at updated_at"`
	SortOrder  string `form:"sort_order" validate:"omitempty,oneof=asc desc"`
}

// Category DTOs
type CategoryResponse struct {
	ResourceID  string    `json:"resource_id"`
	Name        string    `json:"name"`
	Slug        string    `json:"slug"`
	Description string    `json:"description"`
	Image       string    `json:"image"`
	ParentID    *uint     `json:"parent_id"`
	SortOrder   int       `json:"sort_order"`
	IsActive    bool      `json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

// Category list item for home/category listing
type CategoryListItem struct {
    ID            uint   `json:"id"`
    Name          string `json:"name"`
    Slug          string `json:"slug"`
    Image         string `json:"image"`
    ProductsCount int64  `json:"products_count"`
}

type CategoryListResponse struct {
    Categories []CategoryListItem `json:"categories"`
}

type CreateCategoryRequest struct {
	Name        string `json:"name" validate:"required,min=1,max=100"`
	Slug        string `json:"slug" validate:"required,min=1,max=100"`
	Description string `json:"description"`
	Image       string `json:"image" validate:"max=500"`
	ParentID    *uint  `json:"parent_id"`
	SortOrder   int    `json:"sort_order" validate:"min=0"`
	IsActive    bool   `json:"is_active"`
}

type UpdateCategoryRequest struct {
	Name        *string `json:"name" validate:"omitempty,min=1,max=100"`
	Slug        *string `json:"slug" validate:"omitempty,min=1,max=100"`
	Description *string `json:"description"`
	Image       *string `json:"image" validate:"omitempty,max=500"`
	ParentID    *uint   `json:"parent_id"`
	SortOrder   *int    `json:"sort_order" validate:"omitempty,min=0"`
	IsActive    *bool   `json:"is_active"`
}

// Brand DTOs
type BrandResponse struct {
    ID        uint      `json:"id"`
    Name      string    `json:"name"`
    Slug      string    `json:"slug"`
    IsActive  bool      `json:"is_active"`
    CreatedAt time.Time `json:"created_at"`
    UpdatedAt time.Time `json:"updated_at"`
}

type CreateBrandRequest struct {
    Name     string `json:"name" validate:"required,min=1,max=150"`
    Slug     string `json:"slug" validate:"required,min=1,max=150"`
    IsActive bool   `json:"is_active"`
}

type UpdateBrandRequest struct {
    Name     *string `json:"name" validate:"omitempty,min=1,max=150"`
    Slug     *string `json:"slug" validate:"omitempty,min=1,max=150"`
    IsActive *bool   `json:"is_active"`
}

type AdminBrandListResponse struct {
    Brands []BrandResponse `json:"brands"`
    Total  int64           `json:"total"`
}

type ProductSuggestResponse struct {
    ID         uint   `json:"id"`
    ResourceID string `json:"resource_id"`
    Name       string `json:"name"`
    Price      float64 `json:"price"`
    Image      string `json:"image"`
    Brand      string `json:"brand"`
    Slug       string `json:"slug"`
}

// Image DTOs
type ImageResponse struct {
	ResourceID string `json:"resource_id"`
	ProductID  uint   `json:"product_id"`
	URL        string `json:"url"`
	Alt        string `json:"alt"`
	SortOrder  int    `json:"sort_order"`
	IsPrimary  bool   `json:"is_primary"`
	CreatedAt  time.Time `json:"created_at"`
}

type CreateImageRequest struct {
	ProductID  uint   `json:"product_id" validate:"omitempty"`
	URL        string `json:"url" validate:"required"`
	Alt        string `json:"alt" validate:"max=200"`
	SortOrder  int    `json:"sort_order" validate:"min=0"`
	IsPrimary  bool   `json:"is_primary"`
}


// Upload DTOs
type UploadResponse struct {
	ResourceID string    `json:"resource_id"`
	URL        string    `json:"url"`
	Path       string    `json:"path"`
	Size       int64     `json:"size"`
	Type       string    `json:"type"`
	CreatedAt  time.Time `json:"created_at"`
}

type MultipleUploadResponse struct {
	Images []UploadResponse `json:"images"`
	Count  int             `json:"count"`
}

// Variant DTOs
type VariantResponse struct {
	ResourceID    string    `json:"resource_id"`
	ProductID     uint      `json:"product_id"`
	Name          string    `json:"name"`
	SKU           string    `json:"sku"`
	Price         float64   `json:"price"`
	ComparePrice  float64   `json:"compare_price"`
	CostPrice     float64   `json:"cost_price"`
	StockQuantity int       `json:"stock_quantity"`
	Weight        float64   `json:"weight"`
	IsActive      bool      `json:"is_active"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}

type CreateVariantRequest struct {
	ProductID     uint    `json:"product_id" validate:"required"`
	Name          string  `json:"name" validate:"required,min=1,max=255"`
	SKU           string  `json:"sku" validate:"max=100"`
	Price         float64 `json:"price" validate:"min=0"`
	ComparePrice  float64 `json:"compare_price" validate:"min=0"`
	CostPrice     float64 `json:"cost_price" validate:"min=0"`
	StockQuantity int     `json:"stock_quantity" validate:"min=0"`
	Weight        float64 `json:"weight" validate:"min=0"`
	IsActive      bool    `json:"is_active"`
}

// Review DTOs
type ReviewResponse struct {
	ID                 uint                  `json:"id"`
	ResourceID         string                `json:"resource_id"`
	ProductID          uint                  `json:"product_id"`
	UserID             uint                  `json:"user_id"`
	Rating             int                   `json:"rating"`
	Title              string                `json:"title"`
	Comment            string                `json:"comment"`
	IsApproved         bool                  `json:"is_approved"`
	IsVerifiedPurchase bool                  `json:"is_verified_purchase"`
	CreatedAt          time.Time             `json:"created_at"`
	UpdatedAt          time.Time             `json:"updated_at"`
	User               UserSummary           `json:"user"`
	Replies            []ReviewReplyResponse `json:"replies,omitempty"`
}

type ReviewReplyResponse struct {
	ID         uint        `json:"id"`
	ResourceID string      `json:"resource_id"`
	ReviewID   uint        `json:"review_id"`
	UserID     uint        `json:"user_id"`
	Comment    string      `json:"comment"`
	IsApproved bool        `json:"is_approved"`
	CreatedAt  time.Time   `json:"created_at"`
	UpdatedAt  time.Time   `json:"updated_at"`
	User       UserSummary `json:"user"`
}

type UserSummary struct {
	ID        uint   `json:"id"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"email,omitempty"`
}

type CreateReviewRequest struct {
	ProductID uint   `json:"product_id" binding:"required"`
	Rating    int    `json:"rating" binding:"required,min=1,max=5"`
	Comment   string `json:"comment" binding:"required"`
}

type CreateReviewReplyRequest struct {
	ReviewID uint   `json:"review_id" binding:"required"`
	Comment  string `json:"comment" binding:"required"`
}

type UpdateReviewRequest struct {
	Rating  *int    `json:"rating" binding:"omitempty,min=1,max=5"`
	Title   *string `json:"title" binding:"omitempty,max=255"`
	Comment *string `json:"comment" binding:"omitempty"`
}

type ReviewListResponse struct {
	Reviews       []ReviewResponse `json:"reviews"`
	Total         int64            `json:"total"`
	Page          int              `json:"page"`
	Limit         int              `json:"limit"`
	AverageRating float64          `json:"average_rating"`
	RatingCounts  map[int]int      `json:"rating_counts"`
}

// Product list response
type ProductListResponse struct {
	Products []ProductResponse `json:"products"`
	Total    int64             `json:"total"`
	Page     int               `json:"page"`
	Limit    int               `json:"limit"`
}

// Generic pagination descriptor for pages like category
type Pagination struct {
    Page       int   `json:"page"`
    Limit      int   `json:"limit"`
    Total      int64 `json:"total"`
    TotalPages int   `json:"totalPages"`
}

// Category page response by slug
type CategoryPageResponse struct {
    Products   []ProductResponse `json:"products"`
    Pagination Pagination        `json:"pagination"`
}
