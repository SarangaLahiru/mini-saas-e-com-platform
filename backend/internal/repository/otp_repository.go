package repository

import (
	"electronics-store/internal/domain/models"
	"time"

	"gorm.io/gorm"
)

type OTPRepository interface {
	Create(otp *models.OTPVerification) error
	FindByEmailAndCode(email, otpCode, otpType string) (*models.OTPVerification, error)
	FindByResourceID(resourceID string) (*models.OTPVerification, error)
	Update(otp *models.OTPVerification) error
	InvalidateByEmailAndType(email, otpType string) error
	DeleteExpired() error
}

type otpRepository struct {
	db *gorm.DB
}

func NewOTPRepository(db *gorm.DB) OTPRepository {
	return &otpRepository{db: db}
}

func (r *otpRepository) Create(otp *models.OTPVerification) error {
	return r.db.Create(otp).Error
}

func (r *otpRepository) FindByEmailAndCode(email, otpCode, otpType string) (*models.OTPVerification, error) {
	var otp models.OTPVerification
	err := r.db.Where("email = ? AND otp_code = ? AND otp_type = ? AND is_used = ?", 
		email, otpCode, otpType, false).First(&otp).Error
	if err != nil {
		return nil, err
	}
	return &otp, nil
}

func (r *otpRepository) FindByResourceID(resourceID string) (*models.OTPVerification, error) {
	var otp models.OTPVerification
	err := r.db.Where("resource_id = ?", resourceID).First(&otp).Error
	if err != nil {
		return nil, err
	}
	return &otp, nil
}

func (r *otpRepository) Update(otp *models.OTPVerification) error {
	return r.db.Save(otp).Error
}

func (r *otpRepository) InvalidateByEmailAndType(email, otpType string) error {
	return r.db.Model(&models.OTPVerification{}).
		Where("email = ? AND otp_type = ?", email, otpType).
		Update("is_used", true).Error
}

func (r *otpRepository) DeleteExpired() error {
	return r.db.Where("expires_at < ?", time.Now()).Delete(&models.OTPVerification{}).Error
}
