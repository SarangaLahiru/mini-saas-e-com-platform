package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
	"electronics-store/internal/domain/models"
	"electronics-store/internal/dto"
)

type CartHandler struct {
	DB *gorm.DB
}

func NewCartHandler(db *gorm.DB) *CartHandler {
	return &CartHandler{DB: db}
}

// GetCart godoc
// @Summary Get user cart
// @Description Get user's shopping cart
// @Tags cart
// @Accept json
// @Produce json
// @Success 200 {object} dto.SuccessResponse
// @Failure 401 {object} dto.ErrorResponse
// @Router /cart [get]
func (h *CartHandler) GetCart(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	var cart models.Cart
	if err := h.DB.Where("user_id = ?", userID).FirstOrCreate(&cart, models.Cart{UserID: userID.(uint)}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get cart"})
		return
	}
	var items []models.CartItem
	if err := h.DB.Where("cart_id = ?", cart.ID).Preload("Product.Images").Preload("Variant").Find(&items).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to load cart items"})
		return
	}
	var total float64
	var respItems []map[string]interface{}
	for _, item := range items {
		price := item.Product.Price
		total += price * float64(item.Quantity)
		
		// Get primary image
		var imageURL string
		if len(item.Product.Images) > 0 {
			for _, img := range item.Product.Images {
				if img.IsPrimary {
					imageURL = img.URL
					break
				}
			}
			if imageURL == "" {
				imageURL = item.Product.Images[0].URL
			}
		}
		
		respItem := map[string]interface{}{
			"id":         item.ID,
			"product_id": item.ProductID,
			"variant_id": item.VariantID,
			"quantity":   item.Quantity,
			"price":      price,
			"product": map[string]interface{}{
				"id":          item.Product.ID,
				"resource_id": item.Product.ResourceID,
				"name":        item.Product.Name,
				"image":       imageURL,
				"price":       item.Product.Price,
				"sku":         item.Product.SKU,
			},
		}
		
		if item.Variant != nil {
			respItem["variant"] = map[string]interface{}{
				"id":    item.Variant.ID,
				"name":  item.Variant.Name,
				"price": item.Variant.Price,
			}
		}
		
		respItems = append(respItems, respItem)
	}
	c.JSON(http.StatusOK, gin.H{
		"items":      respItems,
		"itemsCount": len(respItems),
		"total":      total,
	})
}

// AddToCart godoc
// @Summary Add item to cart
// @Description Add product to user's cart
// @Tags cart
// @Accept json
// @Produce json
// @Param request body dto.AddToCartRequest true "Add to cart request"
// @Success 200 {object} dto.SuccessResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Router /cart/items [post]
func (h *CartHandler) AddToCart(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	var cart models.Cart
	if err := h.DB.Where("user_id = ?", userID).FirstOrCreate(&cart, models.Cart{UserID: userID.(uint)}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get cart"})
		return
	}
	var req dto.AddToCartRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	
	// Determine product ID (accept either numeric ID or resource_id)
	var productID uint
	if req.ProductID != nil {
		productID = *req.ProductID
	} else if req.ProductResourceID != nil {
		// Look up product by resource_id
		var product models.Product
		if err := h.DB.Where("resource_id = ?", *req.ProductResourceID).First(&product).Error; err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Product not found"})
			return
		}
		productID = product.ID
	} else {
		c.JSON(http.StatusBadRequest, gin.H{"error": "product_id or product_resource_id required"})
		return
	}
	
	var item models.CartItem
	if err := h.DB.Where("cart_id = ? AND product_id = ? AND variant_id = ?", cart.ID, productID, req.VariantID).First(&item).Error; err == nil {
		item.Quantity += req.Quantity
		h.DB.Save(&item)
	} else {
		item = models.CartItem{
			CartID:    cart.ID,
			ProductID: productID,
			VariantID: req.VariantID,
			Quantity:  req.Quantity,
		}
		h.DB.Create(&item)
	}
	h.GetCart(c)
}

// UpdateCartItem godoc
// @Summary Update cart item
// @Description Update quantity of cart item
// @Tags cart
// @Accept json
// @Produce json
// @Param id path string true "Item ID"
// @Param request body dto.UpdateCartItemRequest true "Update cart item request"
// @Success 200 {object} dto.SuccessResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Router /cart/items/{id} [put]
func (h *CartHandler) UpdateCartItem(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	var cart models.Cart
	if err := h.DB.Where("user_id = ?", userID).First(&cart).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get cart"})
		return
	}
	itemID, _ := strconv.Atoi(c.Param("id"))
	var req dto.UpdateCartItemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	var item models.CartItem
	if err := h.DB.Where("id = ? AND cart_id = ?", itemID, cart.ID).First(&item).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Item not found"})
		return
	}
	item.Quantity = req.Quantity
	h.DB.Save(&item)
	h.GetCart(c)
}

// RemoveFromCart godoc
// @Summary Remove item from cart
// @Description Remove product from user's cart
// @Tags cart
// @Accept json
// @Produce json
// @Param id path string true "Item ID"
// @Success 200 {object} dto.SuccessResponse
// @Failure 401 {object} dto.ErrorResponse
// @Router /cart/items/{id} [delete]
func (h *CartHandler) RemoveFromCart(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	var cart models.Cart
	if err := h.DB.Where("user_id = ?", userID).First(&cart).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get cart"})
		return
	}
	itemID, _ := strconv.Atoi(c.Param("id"))
	h.DB.Where("id = ? AND cart_id = ?", itemID, cart.ID).Delete(&models.CartItem{})
	h.GetCart(c)
}

// ClearCart godoc
// @Summary Clear cart
// @Description Clear all items from user's cart
// @Tags cart
// @Accept json
// @Produce json
// @Success 200 {object} dto.SuccessResponse
// @Failure 401 {object} dto.ErrorResponse
// @Router /cart [delete]
func (h *CartHandler) ClearCart(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}
	var cart models.Cart
	if err := h.DB.Where("user_id = ?", userID).First(&cart).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get cart"})
		return
	}
	h.DB.Where("cart_id = ?", cart.ID).Delete(&models.CartItem{})
	h.GetCart(c)
}
