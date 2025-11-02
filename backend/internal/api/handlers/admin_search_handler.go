package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"electronics-store/internal/dto"
	"electronics-store/internal/domain/models"
	"electronics-store/internal/repository"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type AdminSearchHandler struct {
	productRepo  repository.ProductRepository
	orderRepo    repository.OrderRepository
	userRepo     repository.UserRepository
	categoryRepo repository.CategoryRepository
	brandRepo    repository.BrandRepository
	db           *gorm.DB
}

func NewAdminSearchHandler(
	productRepo repository.ProductRepository,
	orderRepo repository.OrderRepository,
	userRepo repository.UserRepository,
	categoryRepo repository.CategoryRepository,
	brandRepo repository.BrandRepository,
	db *gorm.DB,
) *AdminSearchHandler {
	return &AdminSearchHandler{
		productRepo:  productRepo,
		orderRepo:    orderRepo,
		userRepo:     userRepo,
		categoryRepo: categoryRepo,
		brandRepo:    brandRepo,
		db:           db,
	}
}

// Search handles comprehensive admin search across all resources
// @Summary Comprehensive admin search
// @Description Search across products, orders, users, categories, and brands
// @Tags admin
// @Accept json
// @Produce json
// @Param q query string true "Search query"
// @Param limit query int false "Results limit per category" default(5)
// @Success 200 {object} dto.AdminSearchResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /admin/search [get]
func (h *AdminSearchHandler) Search(c *gin.Context) {
	query := strings.TrimSpace(c.Query("q"))
	if query == "" {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: "Search query is required",
		})
		return
	}

	limit := 5
	if limitParam := c.Query("limit"); limitParam != "" {
		if parsedLimit, err := strconv.Atoi(limitParam); err == nil {
			limit = parsedLimit
		}
		if limit > 10 {
			limit = 10 // Cap at 10 per category
		}
	}

	ctx := c.Request.Context()
	queryLower := "%" + strings.ToLower(query) + "%"
	response := dto.AdminSearchResponse{
		Query: query,
		Results: dto.AdminSearchResults{},
	}

	// Search Products
	var products []models.Product
	h.db.WithContext(ctx).
		Preload("Images").
		Preload("Categories").
		Where("LOWER(name) LIKE ? OR LOWER(sku) LIKE ? OR LOWER(description) LIKE ?", queryLower, queryLower, queryLower).
		Limit(limit).
		Find(&products)

	for _, p := range products {
		var imageURL string
		for _, img := range p.Images {
			if img.IsPrimary {
				imageURL = img.URL
				break
			}
		}
		if imageURL == "" && len(p.Images) > 0 {
			imageURL = p.Images[0].URL
		}

		categoryName := ""
		if len(p.Categories) > 0 {
			categoryName = p.Categories[0].Name
		}

		status := "active"
		if !p.IsActive {
			status = "inactive"
		}

		response.Results.Products = append(response.Results.Products, dto.AdminSearchProductResult{
			ResourceID:   p.ResourceID,
			Name:         p.Name,
			SKU:          p.SKU,
			Price:        p.Price,
			Status:       status,
			CategoryName: categoryName,
			Image:        imageURL,
		})
	}

	// Search Orders
	var orders []models.Order
	h.db.WithContext(ctx).
		Preload("User").
		Joins("LEFT JOIN users ON users.id = orders.user_id").
		Where("LOWER(orders.order_number) LIKE ? OR LOWER(users.email) LIKE ? OR LOWER(users.username) LIKE ? OR LOWER(users.first_name) LIKE ? OR LOWER(users.last_name) LIKE ?",
			queryLower, queryLower, queryLower, queryLower, queryLower).
		Limit(limit).
		Find(&orders)

	for _, o := range orders {
		customerName := ""
		// Check if User was loaded (by checking if ID is non-zero or email is not empty)
		if o.User.ID != 0 || o.User.Email != "" {
			if o.User.FirstName != "" && o.User.LastName != "" {
				customerName = o.User.FirstName + " " + o.User.LastName
			} else if o.User.Username != "" {
				customerName = o.User.Username
			} else {
				customerName = o.User.Email
			}
		}

		response.Results.Orders = append(response.Results.Orders, dto.AdminSearchOrderResult{
			ResourceID:  o.ResourceID,
			OrderNumber: o.OrderNumber,
			Customer:    customerName,
			Total:       o.Total,
			Status:      o.Status,
		})
	}

	// Search Users
	var users []models.User
	h.db.WithContext(ctx).
		Where("LOWER(email) LIKE ? OR LOWER(username) LIKE ? OR LOWER(first_name) LIKE ? OR LOWER(last_name) LIKE ? OR LOWER(phone) LIKE ?",
			queryLower, queryLower, queryLower, queryLower, queryLower).
		Limit(limit).
		Find(&users)

	for _, u := range users {
		response.Results.Users = append(response.Results.Users, dto.AdminSearchUserResult{
			ResourceID: u.ResourceID,
			Username:   u.Username,
			Email:      u.Email,
			FirstName:  u.FirstName,
			LastName:   u.LastName,
			IsActive:   u.IsActive,
			IsAdmin:    u.IsAdmin,
		})
	}

	// Search Categories
	var categories []models.Category
	h.db.WithContext(ctx).
		Where("LOWER(name) LIKE ? OR LOWER(slug) LIKE ? OR LOWER(description) LIKE ?", queryLower, queryLower, queryLower).
		Limit(limit).
		Find(&categories)

	for _, cat := range categories {
		response.Results.Categories = append(response.Results.Categories, dto.AdminSearchCategoryResult{
			ResourceID: cat.ResourceID,
			Name:       cat.Name,
			Slug:       cat.Slug,
			Image:      cat.Image,
			IsActive:   cat.IsActive,
		})
	}

	// Search Brands
	var brands []models.Brand
	h.db.WithContext(ctx).
		Where("LOWER(name) LIKE ? OR LOWER(slug) LIKE ?", queryLower, queryLower).
		Limit(limit).
		Find(&brands)

	for _, b := range brands {
		// Convert ID to string for resource_id (Brand model doesn't have ResourceID)
		resourceID := fmt.Sprintf("%d", b.ID)
		response.Results.Brands = append(response.Results.Brands, dto.AdminSearchBrandResult{
			ResourceID: resourceID,
			Name:       b.Name,
			Slug:       b.Slug,
			Image:      "", // Brand model doesn't have Image field
		})
	}

	// Calculate totals
	response.Totals = dto.AdminSearchTotals{
		Products:   int64(len(response.Results.Products)),
		Orders:     int64(len(response.Results.Orders)),
		Users:      int64(len(response.Results.Users)),
		Categories: int64(len(response.Results.Categories)),
		Brands:     int64(len(response.Results.Brands)),
	}

	c.JSON(http.StatusOK, response)
}

