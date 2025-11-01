package dto

import "time"

// ============================================
// ADMIN ANALYTICS DTOs
// ============================================

type AdminDashboardResponse struct {
	TotalRevenue     float64 `json:"total_revenue"`
	TotalOrders      int64   `json:"total_orders"`
	TotalProducts    int64   `json:"total_products"`
	TotalCustomers   int64   `json:"total_customers"`
	RevenueChange    float64 `json:"revenue_change"`    // Percentage change from last month
	OrdersChange     float64 `json:"orders_change"`     // Percentage change from last month
	ProductsChange   float64 `json:"products_change"`   // Percentage change from last month
	CustomersChange  float64 `json:"customers_change"`  // Percentage change from last month
	RecentOrders     []AdminOrderSummary `json:"recent_orders"`
	TopProducts      []AdminTopProduct   `json:"top_products"`
}

type AdminOrderSummary struct {
	ID          uint      `json:"id"`
	OrderNumber string    `json:"order_number"`
	Customer    string    `json:"customer"`
	Total       float64   `json:"total"`
	Status      string    `json:"status"`
	CreatedAt   time.Time `json:"created_at"`
}

type AdminTopProduct struct {
	ID           uint    `json:"id"`
	ResourceID   string  `json:"resource_id"`
	Name         string  `json:"name"`
	SKU          string  `json:"sku"`
	QuantitySold int     `json:"quantity_sold"`
	Revenue      float64 `json:"revenue"`
	OrderCount   int     `json:"order_count"`
	Image        string  `json:"image,omitempty"`
}

type AdminSalesDataResponse struct {
	TotalSales       float64            `json:"total_sales"`
	AverageOrderValue float64            `json:"average_order_value"`
	TotalOrders      int64              `json:"total_orders"`
	SalesByDay       []SalesByDay       `json:"sales_by_day,omitempty"`
	SalesByMonth     []SalesByMonth     `json:"sales_by_month,omitempty"`
}

type SalesByDay struct {
	Date  string  `json:"date"`
	Sales float64 `json:"sales"`
	Orders int64   `json:"orders"`
}

type SalesByMonth struct {
	Month string  `json:"month"`
	Sales float64 `json:"sales"`
	Orders int64   `json:"orders"`
}

// ============================================
// ADMIN PRODUCTS DTOs
// ============================================

type AdminProductListRequest struct {
	Page     int    `form:"page" binding:"omitempty,min=1"`
	Limit    int    `form:"limit" binding:"omitempty,min=1,max=100"`
	Search   string `form:"search"`
	Status   string `form:"status" binding:"omitempty,oneof=active inactive draft"`
	Category uint   `form:"category_id"`
	SortBy    string `form:"sort_by" binding:"omitempty,oneof=name price created_at updated_at stock"`
	SortOrder string `form:"sort_order" binding:"omitempty,oneof=asc desc"`
}

type AdminProductListResponse struct {
	Products []ProductResponse `json:"products"`
	Total    int64             `json:"total"`
	Page     int               `json:"page"`
	Limit    int               `json:"limit"`
}

// ============================================
// ADMIN ORDERS DTOs
// ============================================

type AdminOrderListRequest struct {
	Page          int    `form:"page" binding:"omitempty,min=1"`
	Limit         int    `form:"limit" binding:"omitempty,min=1,max=100"`
	Status        string `form:"status" binding:"omitempty,oneof=pending processing shipped delivered cancelled refunded"`
	PaymentStatus string `form:"payment_status" binding:"omitempty,oneof=pending paid failed refunded"`
	UserID        uint   `form:"user_id"`
	Search        string `form:"search"`
	SortBy        string `form:"sort_by" binding:"omitempty,oneof=created_at total_amount status"`
	SortOrder     string `form:"sort_order" binding:"omitempty,oneof=asc desc"`
}

type AdminOrderListResponse struct {
	Orders []AdminOrderDetailResponse `json:"orders"`
	Total  int64                      `json:"total"`
	Page   int                        `json:"page"`
	Limit  int                        `json:"limit"`
}

type AdminOrderDetailResponse struct {
	OrderResponse
	Customer UserSummary        `json:"customer"`
	Items    []OrderItemResponse `json:"items"`
	Payments []PaymentResponse  `json:"payments,omitempty"`
}

type UpdateOrderStatusRequest struct {
	Status string `json:"status" binding:"required,oneof=pending processing shipped delivered cancelled refunded"`
	Notes  string `json:"notes"`
}

// ============================================
// ADMIN USERS/CUSTOMERS DTOs
// ============================================

type AdminUserListRequest struct {
	Page    int    `form:"page" binding:"omitempty,min=1"`
	Limit   int    `form:"limit" binding:"omitempty,min=1,max=100"`
	Search  string `form:"search"`
	IsActive *bool `form:"is_active"`
	IsAdmin *bool  `form:"is_admin"`
	SortBy  string `form:"sort_by" binding:"omitempty,oneof=created_at email username"`
	SortOrder string `form:"sort_order" binding:"omitempty,oneof=asc desc"`
}

type AdminUserListResponse struct {
	Users []AdminUserResponse `json:"users"`
	Total int64               `json:"total"`
	Page  int                 `json:"page"`
	Limit int                 `json:"limit"`
}

type AdminUserResponse struct {
	ID         uint      `json:"id"`
	ResourceID string    `json:"resource_id"`
	Username   string    `json:"username"`
	Email      string    `json:"email"`
	FirstName  string    `json:"first_name"`
	LastName   string    `json:"last_name"`
	Phone      string    `json:"phone"`
	Avatar     string    `json:"avatar"`
	IsActive   bool      `json:"is_active"`
	IsAdmin    bool      `json:"is_admin"`
	IsVerified bool      `json:"is_verified"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`
	LastLoginAt *time.Time `json:"last_login_at"`
	OrdersCount int64     `json:"orders_count,omitempty"`
	TotalSpent  float64   `json:"total_spent,omitempty"`
}

type UpdateUserRequest struct {
	FirstName *string `json:"first_name" binding:"omitempty,min=1,max=50"`
	LastName  *string `json:"last_name" binding:"omitempty,min=1,max=50"`
	Phone     *string `json:"phone" binding:"omitempty,max=20"`
	IsActive  *bool   `json:"is_active"`
	IsAdmin   *bool   `json:"is_admin"`
}

type AdminUserDetailResponse struct {
	User   AdminUserResponse          `json:"user"`
	Orders []AdminOrderDetailResponse `json:"orders"`
}

// ============================================
// ADMIN CATEGORIES DTOs
// ============================================

type AdminCategoryListRequest struct {
	Page     int  `form:"page" binding:"omitempty,min=1"`
	Limit    int  `form:"limit" binding:"omitempty,min=1,max=100"`
	IsActive *bool `form:"is_active"`
}

type AdminCategoryListResponse struct {
	Categories []CategoryResponse `json:"categories"`
	Total      int64              `json:"total"`
	Page       int                `json:"page"`
	Limit      int                `json:"limit"`
}

// Note: SuccessResponse and ErrorResponse are defined in auth_dto.go

