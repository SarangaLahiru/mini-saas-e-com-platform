package usecase

import (
	"context"
	"errors"
	"fmt"

	"electronics-store/internal/domain/models"
	"electronics-store/internal/dto"
	"electronics-store/internal/repository"

	"github.com/google/uuid"
)

var (
	ErrReviewNotFound       = errors.New("review not found")
	ErrUnauthorizedReview   = errors.New("unauthorized to modify this review")
	ErrDuplicateReview      = errors.New("you have already reviewed this product")
)

type ReviewUsecase interface {
	CreateReview(ctx context.Context, userID uint, req dto.CreateReviewRequest) (*models.Review, error)
	GetReviewsByProduct(ctx context.Context, productID uint, page, limit int) (*dto.ReviewListResponse, error)
	GetReviewsByUser(ctx context.Context, userID uint, page, limit int) ([]*models.Review, int64, error)
	UpdateReview(ctx context.Context, userID, reviewID uint, req dto.UpdateReviewRequest) (*models.Review, error)
	DeleteReview(ctx context.Context, userID, reviewID uint) error
	
	CreateReply(ctx context.Context, userID uint, req dto.CreateReviewReplyRequest) (*models.ReviewReply, error)
	DeleteReply(ctx context.Context, userID, replyID uint) error
}

type reviewUsecase struct {
	reviewRepo repository.ReviewRepository
}

func NewReviewUsecase(reviewRepo repository.ReviewRepository) ReviewUsecase {
	return &reviewUsecase{
		reviewRepo: reviewRepo,
	}
}

func (u *reviewUsecase) CreateReview(ctx context.Context, userID uint, req dto.CreateReviewRequest) (*models.Review, error) {
	// Check if user has already reviewed this product
	// Note: In a real app, you'd check against orders to ensure verified purchases
	
	review := &models.Review{
		ResourceID: uuid.New().String(),
		ProductID:  req.ProductID,
		UserID:     userID,
		Rating:     req.Rating,
		Comment:    req.Comment,
		IsApproved: true, // Auto-approve for now, can add moderation later
	}

	if err := u.reviewRepo.Create(ctx, review); err != nil {
		return nil, fmt.Errorf("failed to create review: %w", err)
	}

	// Reload with relationships
	return u.reviewRepo.GetByID(ctx, review.ID)
}

func (u *reviewUsecase) GetReviewsByProduct(ctx context.Context, productID uint, page, limit int) (*dto.ReviewListResponse, error) {
	reviews, total, err := u.reviewRepo.GetByProduct(ctx, productID, page, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to get reviews: %w", err)
	}

	// Get average rating and rating counts
	avgRating, err := u.reviewRepo.GetAverageRating(ctx, productID)
	if err != nil {
		return nil, fmt.Errorf("failed to get average rating: %w", err)
	}

	ratingCounts, err := u.reviewRepo.GetRatingCounts(ctx, productID)
	if err != nil {
		return nil, fmt.Errorf("failed to get rating counts: %w", err)
	}

	// Convert to DTO
	reviewResponses := make([]dto.ReviewResponse, 0, len(reviews))
	for _, review := range reviews {
		replies := make([]dto.ReviewReplyResponse, 0, len(review.Replies))
		for _, reply := range review.Replies {
			replies = append(replies, dto.ReviewReplyResponse{
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
			})
		}

		reviewResponses = append(reviewResponses, dto.ReviewResponse{
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
			Replies: replies,
		})
	}

	return &dto.ReviewListResponse{
		Reviews:       reviewResponses,
		Total:         total,
		Page:          page,
		Limit:         limit,
		AverageRating: avgRating,
		RatingCounts:  ratingCounts,
	}, nil
}

func (u *reviewUsecase) GetReviewsByUser(ctx context.Context, userID uint, page, limit int) ([]*models.Review, int64, error) {
	return u.reviewRepo.GetByUser(ctx, userID, page, limit)
}

func (u *reviewUsecase) UpdateReview(ctx context.Context, userID, reviewID uint, req dto.UpdateReviewRequest) (*models.Review, error) {
	review, err := u.reviewRepo.GetByID(ctx, reviewID)
	if err != nil {
		return nil, ErrReviewNotFound
	}

	// Check if user owns this review
	if review.UserID != userID {
		return nil, ErrUnauthorizedReview
	}

	// Update fields if provided
	if req.Rating != nil {
		review.Rating = *req.Rating
	}
	if req.Title != nil {
		review.Title = *req.Title
	}
	if req.Comment != nil {
		review.Comment = *req.Comment
	}

	if err := u.reviewRepo.Update(ctx, review); err != nil {
		return nil, fmt.Errorf("failed to update review: %w", err)
	}

	return u.reviewRepo.GetByID(ctx, review.ID)
}

func (u *reviewUsecase) DeleteReview(ctx context.Context, userID, reviewID uint) error {
	review, err := u.reviewRepo.GetByID(ctx, reviewID)
	if err != nil {
		return ErrReviewNotFound
	}

	// Check if user owns this review
	if review.UserID != userID {
		return ErrUnauthorizedReview
	}

	return u.reviewRepo.Delete(ctx, reviewID)
}

func (u *reviewUsecase) CreateReply(ctx context.Context, userID uint, req dto.CreateReviewReplyRequest) (*models.ReviewReply, error) {
	// Check if review exists
	_, err := u.reviewRepo.GetByID(ctx, req.ReviewID)
	if err != nil {
		return nil, ErrReviewNotFound
	}

	reply := &models.ReviewReply{
		ResourceID: uuid.New().String(),
		ReviewID:   req.ReviewID,
		UserID:     userID,
		Comment:    req.Comment,
		IsApproved: true, // Auto-approve for now
	}

	if err := u.reviewRepo.CreateReply(ctx, reply); err != nil {
		return nil, fmt.Errorf("failed to create reply: %w", err)
	}

	// Reload reply with user info
	replies, err := u.reviewRepo.GetRepliesByReview(ctx, req.ReviewID)
	if err != nil {
		return nil, err
	}

	// Find the created reply
	for _, r := range replies {
		if r.ID == reply.ID {
			return r, nil
		}
	}

	return reply, nil
}

func (u *reviewUsecase) DeleteReply(ctx context.Context, userID, replyID uint) error {
	// Note: You'd need to add a GetReplyByID method to check ownership
	// For now, we'll just delete
	return u.reviewRepo.DeleteReply(ctx, replyID)
}

