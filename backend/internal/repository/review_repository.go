package repository

import (
	"context"
	"electronics-store/internal/domain/models"

	"gorm.io/gorm"
)

type ReviewRepository interface {
	Create(ctx context.Context, review *models.Review) error
	GetByID(ctx context.Context, id uint) (*models.Review, error)
	GetByResourceID(ctx context.Context, resourceID string) (*models.Review, error)
	GetByProduct(ctx context.Context, productID uint, page, limit int) ([]*models.Review, int64, error)
	GetByUser(ctx context.Context, userID uint, page, limit int) ([]*models.Review, int64, error)
	Update(ctx context.Context, review *models.Review) error
	Delete(ctx context.Context, id uint) error
	GetAverageRating(ctx context.Context, productID uint) (float64, error)
	GetRatingCounts(ctx context.Context, productID uint) (map[int]int, error)
	
	// Reply methods
	CreateReply(ctx context.Context, reply *models.ReviewReply) error
	GetRepliesByReview(ctx context.Context, reviewID uint) ([]*models.ReviewReply, error)
	DeleteReply(ctx context.Context, id uint) error
}

type reviewRepository struct {
	db *gorm.DB
}

func NewReviewRepository(db *gorm.DB) ReviewRepository {
	return &reviewRepository{db: db}
}

func (r *reviewRepository) Create(ctx context.Context, review *models.Review) error {
	return r.db.WithContext(ctx).Create(review).Error
}

func (r *reviewRepository) GetByID(ctx context.Context, id uint) (*models.Review, error) {
	var review models.Review
	err := r.db.WithContext(ctx).
		Preload("User").
		Preload("Replies").
		Preload("Replies.User").
		First(&review, id).Error
	if err != nil {
		return nil, err
	}
	return &review, nil
}

func (r *reviewRepository) GetByResourceID(ctx context.Context, resourceID string) (*models.Review, error) {
	var review models.Review
	err := r.db.WithContext(ctx).
		Preload("User").
		Preload("Replies").
		Preload("Replies.User").
		Where("resource_id = ?", resourceID).
		First(&review).Error
	if err != nil {
		return nil, err
	}
	return &review, nil
}

func (r *reviewRepository) GetByProduct(ctx context.Context, productID uint, page, limit int) ([]*models.Review, int64, error) {
	var reviews []*models.Review
	var total int64

	offset := (page - 1) * limit

	// Get total count
    err := r.db.WithContext(ctx).
		Model(&models.Review{}).
        Where("product_id = ? AND is_approved = ?", productID, true).
		Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	// Get paginated reviews
	err = r.db.WithContext(ctx).
		Where("product_id = ? AND is_approved = ?", productID, true).
		Preload("User").
		Preload("Replies", "is_approved = ?", true).
		Preload("Replies.User").
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&reviews).Error
	
	if err != nil {
		return nil, 0, err
	}

	return reviews, total, nil
}

func (r *reviewRepository) GetByUser(ctx context.Context, userID uint, page, limit int) ([]*models.Review, int64, error) {
	var reviews []*models.Review
	var total int64

	offset := (page - 1) * limit

	// Get total count
	err := r.db.WithContext(ctx).
		Model(&models.Review{}).
		Where("user_id = ?", userID).
		Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	// Get paginated reviews
	err = r.db.WithContext(ctx).
		Where("user_id = ?", userID).
		Preload("Product").
		Preload("Replies").
		Preload("Replies.User").
		Order("created_at DESC").
		Limit(limit).
		Offset(offset).
		Find(&reviews).Error
	
	if err != nil {
		return nil, 0, err
	}

	return reviews, total, nil
}

func (r *reviewRepository) Update(ctx context.Context, review *models.Review) error {
	return r.db.WithContext(ctx).Save(review).Error
}

func (r *reviewRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&models.Review{}, id).Error
}

func (r *reviewRepository) GetAverageRating(ctx context.Context, productID uint) (float64, error) {
	var avg float64
	err := r.db.WithContext(ctx).
		Model(&models.Review{}).
		Where("product_id = ? AND is_approved = ?", productID, true).
		Select("COALESCE(AVG(rating), 0)").
		Scan(&avg).Error
	return avg, err
}

func (r *reviewRepository) GetRatingCounts(ctx context.Context, productID uint) (map[int]int, error) {
	type RatingCount struct {
		Rating int
		Count  int
	}

	var results []RatingCount
	err := r.db.WithContext(ctx).
		Model(&models.Review{}).
		Select("rating, COUNT(*) as count").
		Where("product_id = ? AND is_approved = ?", productID, true).
		Group("rating").
		Scan(&results).Error
	
	if err != nil {
		return nil, err
	}

	counts := make(map[int]int)
	for i := 1; i <= 5; i++ {
		counts[i] = 0
	}
	
	for _, r := range results {
		counts[r.Rating] = r.Count
	}

	return counts, nil
}

// Reply methods

func (r *reviewRepository) CreateReply(ctx context.Context, reply *models.ReviewReply) error {
	return r.db.WithContext(ctx).Create(reply).Error
}

func (r *reviewRepository) GetRepliesByReview(ctx context.Context, reviewID uint) ([]*models.ReviewReply, error) {
	var replies []*models.ReviewReply
	err := r.db.WithContext(ctx).
		Where("review_id = ? AND is_approved = ?", reviewID, true).
		Preload("User").
		Order("created_at ASC").
		Find(&replies).Error
	
	if err != nil {
		return nil, err
	}

	return replies, nil
}

func (r *reviewRepository) DeleteReply(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&models.ReviewReply{}, id).Error
}

