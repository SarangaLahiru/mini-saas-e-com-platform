package handlers

import (
	"net/http"
	"strconv"

	"electronics-store/internal/dto"
	"electronics-store/internal/repository"
	"electronics-store/internal/usecase"

	"github.com/gin-gonic/gin"
)

type ReviewHandler struct {
	reviewUsecase usecase.ReviewUsecase
	productRepo   repository.ProductRepository
}

func NewReviewHandler(reviewUsecase usecase.ReviewUsecase, productRepo repository.ProductRepository) *ReviewHandler {
	return &ReviewHandler{
		reviewUsecase: reviewUsecase,
		productRepo:   productRepo,
	}
}

// CreateReview godoc
// @Summary Create a product review
// @Description Create a new review for a product (requires authentication)
// @Tags reviews
// @Accept json
// @Produce json
// @Param request body dto.CreateReviewRequest true "Review data"
// @Success 201 {object} dto.ReviewResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Router /reviews [post]
func (h *ReviewHandler) CreateReview(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error:   "Unauthorized",
			Message: "User not authenticated",
		})
		return
	}

	var req dto.CreateReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: err.Error(),
		})
		return
	}

	review, err := h.reviewUsecase.CreateReview(c.Request.Context(), userID.(uint), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to create review",
			Message: err.Error(),
		})
		return
	}

	// Convert to response DTO
	response := dto.ReviewResponse{
		ID:                 review.ID,
		ResourceID:         review.ResourceID,
		ProductID:          review.ProductID,
		UserID:             review.UserID,
		Rating:             review.Rating,
		Title:              review.Title,
		Comment:            review.Comment,
		IsApproved:         review.IsApproved,
		IsVerifiedPurchase: review.IsVerifiedPurchase,
		CreatedAt:          review.CreatedAt,
		UpdatedAt:          review.UpdatedAt,
		User: dto.UserSummary{
			ID:        review.User.ID,
			FirstName: review.User.FirstName,
			LastName:  review.User.LastName,
		},
	}

	c.JSON(http.StatusCreated, response)
}

// GetProductReviews godoc
// @Summary Get reviews for a product
// @Description Get all reviews for a specific product with pagination
// @Tags reviews
// @Produce json
// @Param id path int true "Product ID"
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Success 200 {object} dto.ReviewListResponse
// @Failure 400 {object} dto.ErrorResponse
// @Router /products/{id}/reviews [get]
func (h *ReviewHandler) GetProductReviews(c *gin.Context) {
	productIDStr := c.Param("id")
	var productID uint

	ctx := c.Request.Context()

	// Try to parse as numeric ID first
	if parsedID, err := strconv.ParseUint(productIDStr, 10, 32); err == nil {
		productID = uint(parsedID)
	} else {
		// If not numeric, try to look up by resource ID
		product, err := h.productRepo.GetByResourceID(ctx, productIDStr)
		if err != nil || product == nil {
			c.JSON(http.StatusNotFound, dto.ErrorResponse{
				Error:   "Product not found",
				Message: "Product with the given ID does not exist",
			})
			return
		}
		productID = product.ID
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	reviews, err := h.reviewUsecase.GetReviewsByProduct(ctx, productID, page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to get reviews",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, reviews)
}

// GetUserReviews godoc
// @Summary Get reviews by user
// @Description Get all reviews created by the authenticated user
// @Tags reviews
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param limit query int false "Items per page" default(10)
// @Success 200 {object} dto.ReviewListResponse
// @Failure 401 {object} dto.ErrorResponse
// @Router /reviews/my [get]
func (h *ReviewHandler) GetUserReviews(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error:   "Unauthorized",
			Message: "User not authenticated",
		})
		return
	}

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	reviews, total, err := h.reviewUsecase.GetReviewsByUser(c.Request.Context(), userID.(uint), page, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to get reviews",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"reviews": reviews,
		"total":   total,
		"page":    page,
		"limit":   limit,
	})
}

// UpdateReview godoc
// @Summary Update a review
// @Description Update an existing review (user must own the review)
// @Tags reviews
// @Accept json
// @Produce json
// @Param id path int true "Review ID"
// @Param request body dto.UpdateReviewRequest true "Updated review data"
// @Success 200 {object} dto.ReviewResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Failure 403 {object} dto.ErrorResponse
// @Router /reviews/{id} [put]
func (h *ReviewHandler) UpdateReview(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error:   "Unauthorized",
			Message: "User not authenticated",
		})
		return
	}

	reviewIDStr := c.Param("id")
	reviewID, err := strconv.ParseUint(reviewIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid review ID",
			Message: "Review ID must be a valid number",
		})
		return
	}

	var req dto.UpdateReviewRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: err.Error(),
		})
		return
	}

	review, err := h.reviewUsecase.UpdateReview(c.Request.Context(), userID.(uint), uint(reviewID), req)
	if err != nil {
		if err == usecase.ErrUnauthorizedReview {
			c.JSON(http.StatusForbidden, dto.ErrorResponse{
				Error:   "Forbidden",
				Message: "You can only update your own reviews",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to update review",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, review)
}

// DeleteReview godoc
// @Summary Delete a review
// @Description Delete a review (user must own the review)
// @Tags reviews
// @Param id path int true "Review ID"
// @Success 200 {object} dto.SuccessResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Failure 403 {object} dto.ErrorResponse
// @Router /reviews/{id} [delete]
func (h *ReviewHandler) DeleteReview(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error:   "Unauthorized",
			Message: "User not authenticated",
		})
		return
	}

	reviewIDStr := c.Param("id")
	reviewID, err := strconv.ParseUint(reviewIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid review ID",
			Message: "Review ID must be a valid number",
		})
		return
	}

	err = h.reviewUsecase.DeleteReview(c.Request.Context(), userID.(uint), uint(reviewID))
	if err != nil {
		if err == usecase.ErrUnauthorizedReview {
			c.JSON(http.StatusForbidden, dto.ErrorResponse{
				Error:   "Forbidden",
				Message: "You can only delete your own reviews",
			})
			return
		}
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to delete review",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Message: "Review deleted successfully",
	})
}

// CreateReply godoc
// @Summary Reply to a review
// @Description Create a reply to an existing review (requires authentication)
// @Tags reviews
// @Accept json
// @Produce json
// @Param request body dto.CreateReviewReplyRequest true "Reply data"
// @Success 201 {object} dto.ReviewReplyResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Router /reviews/replies [post]
func (h *ReviewHandler) CreateReply(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error:   "Unauthorized",
			Message: "User not authenticated",
		})
		return
	}

	var req dto.CreateReviewReplyRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: err.Error(),
		})
		return
	}

	reply, err := h.reviewUsecase.CreateReply(c.Request.Context(), userID.(uint), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to create reply",
			Message: err.Error(),
		})
		return
	}

	// Convert to response DTO
	response := dto.ReviewReplyResponse{
		ID:         reply.ID,
		ResourceID: reply.ResourceID,
		ReviewID:   reply.ReviewID,
		UserID:     reply.UserID,
		Comment:    reply.Comment,
		IsApproved: reply.IsApproved,
		CreatedAt:  reply.CreatedAt,
		UpdatedAt:  reply.UpdatedAt,
		User: dto.UserSummary{
			ID:        reply.User.ID,
			FirstName: reply.User.FirstName,
			LastName:  reply.User.LastName,
		},
	}

	c.JSON(http.StatusCreated, response)
}

// DeleteReply godoc
// @Summary Delete a reply
// @Description Delete a reply to a review (user must own the reply)
// @Tags reviews
// @Param id path int true "Reply ID"
// @Success 200 {object} dto.SuccessResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Router /reviews/replies/{id} [delete]
func (h *ReviewHandler) DeleteReply(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error:   "Unauthorized",
			Message: "User not authenticated",
		})
		return
	}

	replyIDStr := c.Param("id")
	replyID, err := strconv.ParseUint(replyIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid reply ID",
			Message: "Reply ID must be a valid number",
		})
		return
	}

	err = h.reviewUsecase.DeleteReply(c.Request.Context(), userID.(uint), uint(replyID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to delete reply",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Message: "Reply deleted successfully",
	})
}

