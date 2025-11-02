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

type SearchHandler struct {
	productRepo  repository.ProductRepository
	categoryRepo repository.CategoryRepository
	brandRepo    repository.BrandRepository
	db           *gorm.DB
}

func NewSearchHandler(
	productRepo repository.ProductRepository,
	categoryRepo repository.CategoryRepository,
	brandRepo repository.BrandRepository,
	db *gorm.DB,
) *SearchHandler {
	return &SearchHandler{
		productRepo:  productRepo,
		categoryRepo: categoryRepo,
		brandRepo:    brandRepo,
		db:           db,
	}
}

// Search handles comprehensive public search across products, categories, and brands
// @Summary Comprehensive public search
// @Description Search across products, categories, and brands
// @Tags search
// @Accept json
// @Produce json
// @Param q query string true "Search query"
// @Param limit query int false "Results limit per category" default(5)
// @Success 200 {object} dto.SearchResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /search [get]
func (h *SearchHandler) Search(c *gin.Context) {
	query := strings.TrimSpace(c.Query("q"))
	if query == "" || len(query) < 2 {
		c.JSON(http.StatusOK, dto.SearchResponse{
			Query:   query,
			Results: dto.SearchResults{},
			Totals:  dto.SearchTotals{},
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
	response := dto.SearchResponse{
		Query: query,
		Results: dto.SearchResults{},
	}

	// Search Products (only active)
	var products []models.Product
	h.db.WithContext(ctx).
		Preload("Images", "is_primary = ?", true).
		Preload("BrandRef").
		Where("is_active = ?", true).
		Where("LOWER(name) LIKE ? OR LOWER(description) LIKE ? OR LOWER(sku) LIKE ?", queryLower, queryLower, queryLower).
		Limit(limit).
		Find(&products)

	for _, p := range products {
		var imageURL string
		if len(p.Images) > 0 {
			imageURL = p.Images[0].URL
		}

		brandName := ""
		if p.BrandRef != nil {
			brandName = p.BrandRef.Name
		}

		response.Results.Products = append(response.Results.Products, dto.ProductSearchResult{
			ResourceID: p.ResourceID,
			Name:       p.Name,
			Slug:       p.ResourceID,
			Price:      p.Price,
			Image:      imageURL,
			Brand:      brandName,
		})
	}

	// Search Categories (only active)
	var categories []models.Category
	h.db.WithContext(ctx).
		Where("is_active = ?", true).
		Where("LOWER(name) LIKE ? OR LOWER(slug) LIKE ?", queryLower, queryLower).
		Limit(limit).
		Find(&categories)

	for _, cat := range categories {
		response.Results.Categories = append(response.Results.Categories, dto.CategorySearchResult{
			ResourceID: cat.ResourceID,
			Name:       cat.Name,
			Slug:       cat.Slug,
			Image:      cat.Image,
		})
	}

	// Search Brands (only active)
	var brands []models.Brand
	h.db.WithContext(ctx).
		Where("is_active = ?", true).
		Where("LOWER(name) LIKE ? OR LOWER(slug) LIKE ?", queryLower, queryLower).
		Limit(limit).
		Find(&brands)

	for _, b := range brands {
		resourceID := fmt.Sprintf("%d", b.ID)
		response.Results.Brands = append(response.Results.Brands, dto.BrandSearchResult{
			ResourceID: resourceID,
			Name:       b.Name,
			Slug:       b.Slug,
		})
	}

	// Calculate totals
	response.Totals = dto.SearchTotals{
		Products:   int64(len(response.Results.Products)),
		Categories: int64(len(response.Results.Categories)),
		Brands:     int64(len(response.Results.Brands)),
	}

	c.JSON(http.StatusOK, response)
}

