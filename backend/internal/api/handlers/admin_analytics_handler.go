package handlers

import (
	"net/http"
	"strconv"
	"time"

	"electronics-store/internal/dto"
	"electronics-store/internal/database"

	"github.com/gin-gonic/gin"
)

type AdminAnalyticsHandler struct {
	db *database.Connection
}

func NewAdminAnalyticsHandler(db *database.Connection) *AdminAnalyticsHandler {
	return &AdminAnalyticsHandler{
		db: db,
	}
}

// GetDashboard godoc
// @Summary Get dashboard analytics
// @Description Get dashboard statistics including revenue, orders, products, customers
// @Tags admin
// @Accept json
// @Produce json
// @Success 200 {object} dto.AdminDashboardResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /admin/analytics [get]
func (h *AdminAnalyticsHandler) GetDashboard(c *gin.Context) {
	ctx := c.Request.Context()

	// Get current period stats (this month)
	now := time.Now()
	currentMonthStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	lastMonthStart := currentMonthStart.AddDate(0, -1, 0)
	lastMonthEnd := currentMonthStart.Add(-time.Second)

	var totalRevenue, lastMonthRevenue float64
	var totalOrders, lastMonthOrders int64
	var totalProducts, lastMonthProducts int64
	var totalCustomers, lastMonthCustomers int64

	// Calculate revenue (this month) - using 'total_amount' column from database schema
	h.db.DB.WithContext(ctx).
		Model(&struct {
			TotalAmount float64 `gorm:"column:total_amount"`
		}{}).
		Table("orders").
		Where("status != ? AND status != ?", "cancelled", "refunded").
		Where("created_at >= ?", currentMonthStart).
		Select("COALESCE(SUM(total_amount), 0) as total_amount").
		Scan(&totalRevenue)

	// Calculate revenue (last month) - using 'total_amount' column from database schema
	h.db.DB.WithContext(ctx).
		Model(&struct {
			TotalAmount float64 `gorm:"column:total_amount"`
		}{}).
		Table("orders").
		Where("status != ? AND status != ?", "cancelled", "refunded").
		Where("created_at >= ? AND created_at <= ?", lastMonthStart, lastMonthEnd).
		Select("COALESCE(SUM(total_amount), 0) as total_amount").
		Scan(&lastMonthRevenue)

	// Calculate orders (this month)
	h.db.DB.WithContext(ctx).
		Model(&struct {
			Count int64
		}{}).
		Table("orders").
		Where("created_at >= ?", currentMonthStart).
		Select("COUNT(*) as count").
		Scan(&totalOrders)

	// Calculate orders (last month)
	h.db.DB.WithContext(ctx).
		Model(&struct {
			Count int64
		}{}).
		Table("orders").
		Where("created_at >= ? AND created_at <= ?", lastMonthStart, lastMonthEnd).
		Select("COUNT(*) as count").
		Scan(&lastMonthOrders)

	// Calculate products (total)
	h.db.DB.WithContext(ctx).
		Model(&struct {
			Count int64
		}{}).
		Table("products").
		Where("deleted_at IS NULL").
		Select("COUNT(*) as count").
		Scan(&totalProducts)

	// For products change, we compare total products now vs last month end
	// totalProducts already has current total, lastMonthProducts has last month total

	// Calculate total products (last month)
	h.db.DB.WithContext(ctx).
		Model(&struct {
			Count int64
		}{}).
		Table("products").
		Where("created_at >= ? AND created_at <= ?", lastMonthStart, lastMonthEnd).
		Where("deleted_at IS NULL").
		Select("COUNT(*) as count").
		Scan(&lastMonthProducts)

	// Calculate customers (total)
	h.db.DB.WithContext(ctx).
		Model(&struct {
			Count int64
		}{}).
		Table("users").
		Where("deleted_at IS NULL").
		Select("COUNT(*) as count").
		Scan(&totalCustomers)

	// Calculate customers (last month)
	h.db.DB.WithContext(ctx).
		Model(&struct {
			Count int64
		}{}).
		Table("users").
		Where("created_at >= ? AND created_at <= ?", lastMonthStart, lastMonthEnd).
		Where("deleted_at IS NULL").
		Select("COUNT(*) as count").
		Scan(&lastMonthCustomers)

	// Calculate percentage changes
	revenueChange := calculatePercentageChange(lastMonthRevenue, totalRevenue)
	ordersChange := calculatePercentageChange(float64(lastMonthOrders), float64(totalOrders))
	productsChange := calculatePercentageChange(float64(lastMonthProducts), float64(totalProducts))
	customersChange := calculatePercentageChange(float64(lastMonthCustomers), float64(totalCustomers))

	// Get recent orders (last 5)
	var recentOrders []dto.AdminOrderSummary
	h.db.DB.WithContext(ctx).
		Table("orders").
		Select(`
			orders.id,
			orders.order_number,
			orders.total_amount as total,
			orders.status,
			orders.created_at,
			COALESCE(
				NULLIF(TRIM(CONCAT(COALESCE(users.first_name, ''), ' ', COALESCE(users.last_name, ''))), ' '),
				COALESCE(users.username, users.email, 'Guest')
			) as customer
		`).
		Joins("LEFT JOIN users ON orders.user_id = users.id AND users.deleted_at IS NULL").
		Where("orders.status IS NOT NULL").
		Order("orders.created_at DESC").
		Limit(5).
		Scan(&recentOrders)

	// Get top products (top 5 by revenue)
	var topProducts []dto.AdminTopProduct
	h.db.DB.WithContext(ctx).
		Table("order_items").
		Select(`
			products.id,
			products.resource_id,
			products.name,
			COALESCE(products.sku, '') as sku,
			COALESCE(SUM(order_items.quantity), 0) as quantity_sold,
			COALESCE(SUM(order_items.total_price), 0) as revenue,
			COUNT(DISTINCT order_items.order_id) as order_count,
			COALESCE(
				(SELECT url FROM images WHERE images.product_id = products.id AND images.is_primary = true LIMIT 1),
				''
			) as image
		`).
		Joins("INNER JOIN orders ON order_items.order_id = orders.id").
		Joins("INNER JOIN products ON order_items.product_id = products.id AND products.deleted_at IS NULL").
		Where("orders.status != ? AND orders.status != ?", "cancelled", "refunded").
		Group("products.id, products.resource_id, products.name, products.sku").
		Order("revenue DESC").
		Limit(5).
		Scan(&topProducts)

	response := dto.AdminDashboardResponse{
		TotalRevenue:    totalRevenue,
		TotalOrders:     totalOrders,
		TotalProducts:   totalProducts,
		TotalCustomers:  totalCustomers,
		RevenueChange:   revenueChange,
		OrdersChange:    ordersChange,
		ProductsChange:  productsChange,
		CustomersChange: customersChange,
		RecentOrders:    recentOrders,
		TopProducts:     topProducts,
	}

	c.JSON(http.StatusOK, response)
}

// GetSalesData godoc
// @Summary Get sales data
// @Description Get sales statistics for a given time period with different grouping options
// @Tags admin
// @Accept json
// @Produce json
// @Param days query int false "Number of days" default(30)
// @Param group query string false "Grouping: daily, weekly, monthly, yearly" default(daily)
// @Success 200 {object} dto.AdminSalesDataResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /admin/analytics/sales [get]
func (h *AdminAnalyticsHandler) GetSalesData(c *gin.Context) {
	ctx := c.Request.Context()

	daysStr := c.DefaultQuery("days", "30")
	days, err := strconv.Atoi(daysStr)
	if err != nil || days <= 0 {
		days = 30
	}

	groupBy := c.DefaultQuery("group", "daily")
	if groupBy != "daily" && groupBy != "weekly" && groupBy != "monthly" && groupBy != "yearly" {
		groupBy = "daily"
	}

	startDate := time.Now().AddDate(0, 0, -days)

	var totalSales float64
	var totalOrders int64

	// Calculate total sales - using 'total_amount' column from database schema
	h.db.DB.WithContext(ctx).
		Model(&struct {
			TotalAmount float64 `gorm:"column:total_amount"`
		}{}).
		Table("orders").
		Where("status != ? AND status != ?", "cancelled", "refunded").
		Where("created_at >= ?", startDate).
		Select("COALESCE(SUM(total_amount), 0) as total_amount").
		Scan(&totalSales)

	// Calculate total orders
	h.db.DB.WithContext(ctx).
		Model(&struct {
			Count int64
		}{}).
		Table("orders").
		Where("created_at >= ?", startDate).
		Select("COUNT(*) as count").
		Scan(&totalOrders)

	// Calculate average order value
	avgOrderValue := float64(0)
	if totalOrders > 0 {
		avgOrderValue = totalSales / float64(totalOrders)
	}

	var salesByDay []dto.SalesByDay

	// Get sales data based on grouping
	switch groupBy {
	case "daily":
		// Group by day
		h.db.DB.WithContext(ctx).
			Table("orders").
			Select(`
				DATE(created_at) as date,
				COALESCE(SUM(total_amount), 0) as sales,
				COUNT(*) as orders
			`).
			Where("status != ? AND status != ?", "cancelled", "refunded").
			Where("created_at >= ?", startDate).
			Group("DATE(created_at)").
			Order("date ASC").
			Scan(&salesByDay)

	case "weekly":
		// Group by week (start of week - Monday)
		h.db.DB.WithContext(ctx).
			Table("orders").
			Select(`
				DATE(DATE_SUB(created_at, INTERVAL WEEKDAY(created_at) DAY)) as date,
				COALESCE(SUM(total_amount), 0) as sales,
				COUNT(*) as orders
			`).
			Where("status != ? AND status != ?", "cancelled", "refunded").
			Where("created_at >= ?", startDate).
			Group("DATE(DATE_SUB(created_at, INTERVAL WEEKDAY(created_at) DAY))").
			Order("date ASC").
			Scan(&salesByDay)

	case "monthly":
		// Group by month
		type MonthlyData struct {
			Month  string  `json:"month"`
			Sales  float64 `json:"sales"`
			Orders int64   `json:"orders"`
		}
		var monthlyData []MonthlyData
		h.db.DB.WithContext(ctx).
			Table("orders").
			Select(`
				DATE_FORMAT(created_at, '%Y-%m') as month,
				COALESCE(SUM(total_amount), 0) as sales,
				COUNT(*) as orders
			`).
			Where("status != ? AND status != ?", "cancelled", "refunded").
			Where("created_at >= ?", startDate).
			Group("DATE_FORMAT(created_at, '%Y-%m')").
			Order("month ASC").
			Scan(&monthlyData)
		
		// Convert monthly data to daily format for consistency
		salesByDay = make([]dto.SalesByDay, len(monthlyData))
		for i, m := range monthlyData {
			salesByDay[i] = dto.SalesByDay{
				Date:  m.Month + "-01", // Use first day of month as date
				Sales: m.Sales,
				Orders: m.Orders,
			}
		}

	case "yearly":
		// Group by year
		type YearlyData struct {
			Year   string  `json:"year"`
			Sales  float64 `json:"sales"`
			Orders int64   `json:"orders"`
		}
		var yearlyData []YearlyData
		h.db.DB.WithContext(ctx).
			Table("orders").
			Select(`
				DATE_FORMAT(created_at, '%Y') as year,
				COALESCE(SUM(total_amount), 0) as sales,
				COUNT(*) as orders
			`).
			Where("status != ? AND status != ?", "cancelled", "refunded").
			Where("created_at >= ?", startDate).
			Group("DATE_FORMAT(created_at, '%Y')").
			Order("year ASC").
			Scan(&yearlyData)
		
		// Convert yearly data to daily format for consistency
		salesByDay = make([]dto.SalesByDay, len(yearlyData))
		for i, y := range yearlyData {
			salesByDay[i] = dto.SalesByDay{
				Date:  y.Year + "-01-01", // Use first day of year as date
				Sales: y.Sales,
				Orders: y.Orders,
			}
		}
	}

	response := dto.AdminSalesDataResponse{
		TotalSales:       totalSales,
		AverageOrderValue: avgOrderValue,
		TotalOrders:      totalOrders,
		SalesByDay:       salesByDay,
	}

	c.JSON(http.StatusOK, response)
}

// GetTopProducts godoc
// @Summary Get top selling products
// @Description Get top selling products by revenue or quantity
// @Tags admin
// @Accept json
// @Produce json
// @Param limit query int false "Number of products" default(10)
// @Param days query int false "Number of days" default(30)
// @Success 200 {object} dto.SuccessResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /admin/analytics/top-products [get]
func (h *AdminAnalyticsHandler) GetTopProducts(c *gin.Context) {
	ctx := c.Request.Context()

	limitStr := c.DefaultQuery("limit", "10")
	limit, err := strconv.Atoi(limitStr)
	if err != nil || limit <= 0 || limit > 100 {
		limit = 10
	}

	daysStr := c.DefaultQuery("days", "30")
	days, err := strconv.Atoi(daysStr)
	if err != nil || days <= 0 {
		days = 30
	}

	startDate := time.Now().AddDate(0, 0, -days)

	var topProducts []dto.AdminTopProduct
	h.db.DB.WithContext(ctx).
		Table("order_items").
		Select(`
			products.id,
			products.resource_id,
			products.name,
			products.sku,
			SUM(order_items.quantity) as quantity_sold,
			SUM(order_items.total_price) as revenue,
			COUNT(DISTINCT order_items.order_id) as order_count,
			(SELECT url FROM images WHERE images.product_id = products.id AND images.is_primary = true LIMIT 1) as image
		`).
		Joins("INNER JOIN orders ON order_items.order_id = orders.id").
		Joins("INNER JOIN products ON order_items.product_id = products.id AND products.deleted_at IS NULL").
		Where("orders.status != ? AND orders.status != ?", "cancelled", "refunded").
		Where("orders.created_at >= ?", startDate).
		Group("products.id, products.resource_id, products.name, products.sku").
		Order("revenue DESC").
		Limit(limit).
		Scan(&topProducts)

	c.JSON(http.StatusOK, gin.H{
		"products": topProducts,
	})
}

// Helper function to calculate percentage change
func calculatePercentageChange(oldValue, newValue float64) float64 {
	if oldValue == 0 {
		if newValue > 0 {
			return 100.0
		}
		return 0.0
	}
	return ((newValue - oldValue) / oldValue) * 100.0
}

