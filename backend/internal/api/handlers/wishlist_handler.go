package handlers

import (
	"fmt"
	"net/http"

	"electronics-store/internal/domain/models"
	"electronics-store/internal/dto"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type WishlistHandler struct {
	DB *gorm.DB
}

func NewWishlistHandler(db *gorm.DB) *WishlistHandler {
	return &WishlistHandler{DB: db}
}

// GetWishlist godoc
// @Summary Get user wishlist
// @Tags wishlist
// @Produce json
// @Success 200 {array} dto.WishlistResponse
// @Failure 401 {object} dto.ErrorResponse
// @Router /wishlist [get]
func (h *WishlistHandler) GetWishlist(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var rows []models.Wishlist
	if err := h.DB.Where("user_id = ?", userID).Preload("Product.Images").Find(&rows).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load wishlist"})
		return
	}

	responses := make([]gin.H, 0, len(rows))
	for _, w := range rows {
		var imageURL string
		if len(w.Product.Images) > 0 {
			imageURL = w.Product.Images[0].URL
		}
		responses = append(responses, gin.H{
			"id":         w.ID,
			"resource_id": w.ResourceID,
			"user_id":    w.UserID,
			"product_id": w.ProductID,
			"product": gin.H{
				"id":          w.Product.ID,
				"resource_id": w.Product.ResourceID,
				"name":        w.Product.Name,
				"image":       imageURL,
				"price":       w.Product.Price,
			},
		})
	}
	c.JSON(http.StatusOK, responses)
}

// AddToWishlist godoc
// @Summary Add product to wishlist
// @Tags wishlist
// @Accept json
// @Produce json
// @Param request body dto.AddToWishlistRequest true "Add to wishlist request"
// @Success 200 {object} dto.SuccessResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Router /wishlist [post]
func (h *WishlistHandler) AddToWishlist(c *gin.Context) {
	userIDInterface, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Convert userID from interface{} to uint
	userID, ok := userIDInterface.(uint)
	if !ok {
		// Try float64 conversion (from JSON parsing)
		if floatID, isFloat := userIDInterface.(float64); isFloat {
			userID = uint(floatID)
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID type"})
			return
		}
	}

	var req dto.AddToWishlistRequest
	if err := c.ShouldBindJSON(&req); err != nil || req.ProductID == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	// Check if exists
	var existing models.Wishlist
	if err := h.DB.Where("user_id = ? AND product_id = ?", userID, req.ProductID).First(&existing).Error; err == nil {
		c.JSON(http.StatusOK, gin.H{"message": "Already in wishlist", "id": existing.ID})
		return
	}

	row := models.Wishlist{UserID: userID, ProductID: req.ProductID}
	if err := h.DB.Create(&row).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add to wishlist"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Added to wishlist", "id": row.ID})
}

// RemoveFromWishlist godoc
// @Summary Remove product from wishlist
// @Tags wishlist
// @Param productId path int true "Product ID"
// @Success 200 {object} dto.SuccessResponse
// @Failure 401 {object} dto.ErrorResponse
// @Router /wishlist/{productId} [delete]
func (h *WishlistHandler) RemoveFromWishlist(c *gin.Context) {
	userIDInterface, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Convert userID from interface{} to uint
	userID, ok := userIDInterface.(uint)
	if !ok {
		// Try float64 conversion (from JSON parsing)
		if floatID, isFloat := userIDInterface.(float64); isFloat {
			userID = uint(floatID)
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Invalid user ID type"})
			return
		}
	}

	productIDStr := c.Param("productId")
	if productIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Product ID required"})
		return
	}

	// Parse productID from string to uint
	var productID uint
	if _, err := fmt.Sscanf(productIDStr, "%d", &productID); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	if err := h.DB.Where("user_id = ? AND product_id = ?", userID, productID).Delete(&models.Wishlist{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove from wishlist"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Removed from wishlist"})
}
