package services

import (
	"crypto/rand"
	"fmt"
	"math/big"
	"strings"
	"time"

	"electronics-store/internal/domain/models"
	"electronics-store/internal/repository"
	"gorm.io/gorm"
)

type OTPService struct {
	otpRepo      repository.OTPRepository
	emailService *EmailService
}

func NewOTPService(otpRepo repository.OTPRepository, emailService *EmailService) *OTPService {
	return &OTPService{
		otpRepo:      otpRepo,
		emailService: emailService,
	}
}

// GenerateOTP generates a 6-digit OTP code
func (s *OTPService) GenerateOTP() (string, error) {
	// Generate a random 6-digit number
	max := big.NewInt(999999)
	min := big.NewInt(100000)
	
	n, err := rand.Int(rand.Reader, new(big.Int).Sub(max, min))
	if err != nil {
		return "", err
	}
	
	otp := n.Add(n, min)
	return fmt.Sprintf("%06d", otp.Int64()), nil
}

// SendOTP creates and stores an OTP verification record
func (s *OTPService) SendOTP(email, otpType string, userID *uint) (*models.OTPVerification, error) {
	// Generate OTP code
	otpCode, err := s.GenerateOTP()
	if err != nil {
		return nil, fmt.Errorf("failed to generate OTP: %w", err)
	}

	// Set expiration time (15 minutes from now)
	expiresAt := time.Now().Add(15 * time.Minute)

	// Create OTP verification record
	otp := &models.OTPVerification{
		Email:     email,
		OTPCode:   otpCode,
		OTPType:   otpType,
		ExpiresAt: expiresAt,
	}

	if userID != nil {
		otp.UserID = userID
	}

	// Save to database
	if err := s.otpRepo.Create(otp); err != nil {
		return nil, fmt.Errorf("failed to save OTP: %w", err)
	}

	// Send OTP via email
	if s.emailService != nil {
		// Extract name from email (before @)
		name := strings.Split(email, "@")[0]
		if err := s.emailService.SendOTPEmail(email, name, otpCode, otpType); err != nil {
			// Log error but don't fail the request
			fmt.Printf("Failed to send OTP email to %s: %v\n", email, err)
		}
	} else {
		// Fallback: log OTP (for development)
		fmt.Printf("OTP for %s (%s): %s (expires at: %s)\n", email, otpType, otpCode, expiresAt.Format(time.RFC3339))
	}

	return otp, nil
}

// VerifyOTP verifies an OTP code
func (s *OTPService) VerifyOTP(email, otpCode, otpType string) (*models.OTPVerification, error) {
	// Find the OTP record
	otp, err := s.otpRepo.FindByEmailAndCode(email, otpCode, otpType)
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("invalid OTP code")
		}
		return nil, fmt.Errorf("failed to find OTP: %w", err)
	}

	// Check if OTP is already used
	if otp.IsUsed {
		return nil, fmt.Errorf("OTP code has already been used")
	}

	// Check if OTP is expired
	if time.Now().After(otp.ExpiresAt) {
		return nil, fmt.Errorf("OTP code has expired")
	}

	// Mark OTP as used
	otp.IsUsed = true
	if err := s.otpRepo.Update(otp); err != nil {
		return nil, fmt.Errorf("failed to update OTP: %w", err)
	}

	return otp, nil
}

// ResendOTP resends an OTP (invalidates old one and creates new one)
func (s *OTPService) ResendOTP(email, otpType string, userID *uint) (*models.OTPVerification, error) {
	// Invalidate any existing OTPs for this email and type
	if err := s.otpRepo.InvalidateByEmailAndType(email, otpType); err != nil {
		return nil, fmt.Errorf("failed to invalidate existing OTPs: %w", err)
	}

	// Send new OTP
	return s.SendOTP(email, otpType, userID)
}

// CleanupExpiredOTPs removes expired OTPs from the database
func (s *OTPService) CleanupExpiredOTPs() error {
	return s.otpRepo.DeleteExpired()
}
