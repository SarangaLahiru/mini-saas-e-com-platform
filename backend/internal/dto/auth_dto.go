package dto

import (
	"errors"
	"regexp"
	"strings"
)

// Auth DTOs

type RegisterRequest struct {
	Username  string `json:"username" binding:"required,min=3,max=50"`
	Email     string `json:"email" binding:"required,email"`
	Password  string `json:"password" binding:"required,min=8"`
	FirstName string `json:"firstName" binding:"required,min=2,max=50"`
	LastName  string `json:"lastName" binding:"required,min=2,max=50"`
	Phone     string `json:"phone" binding:"omitempty,min=10,max=20"`
}

func (r *RegisterRequest) Validate() error {
	// Validate username format
	if !isValidUsername(r.Username) {
		return errors.New("username must contain only letters, numbers, and underscores")
	}

	// Validate password strength
	if !isValidPassword(r.Password) {
		return errors.New("password must contain at least 8 characters with uppercase, lowercase, number, and special character")
	}

	// Validate phone format if provided
	if r.Phone != "" && !isValidPhone(r.Phone) {
		return errors.New("phone number format is invalid")
	}

	return nil
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func (l *LoginRequest) Validate() error {
	return nil
}

type GoogleAuthRequest struct {
	GoogleID  string `json:"google_id" binding:"required"`
	Email     string `json:"email" binding:"required,email"`
	Username  string `json:"username" binding:"required"`
	FirstName string `json:"first_name" binding:"required"`
	LastName  string `json:"last_name" binding:"required"`
	Avatar    string `json:"avatar" binding:"omitempty,url"`
}

type GoogleIDTokenRequest struct {
	IDToken string `json:"id_token" binding:"required"`
}

func (g *GoogleAuthRequest) Validate() error {
	if strings.TrimSpace(g.GoogleID) == "" {
		return errors.New("google_id is required")
	}
	if strings.TrimSpace(g.Email) == "" {
		return errors.New("email is required")
	}
	if strings.TrimSpace(g.Username) == "" {
		return errors.New("username is required")
	}
	if strings.TrimSpace(g.FirstName) == "" {
		return errors.New("first name is required")
	}
	if strings.TrimSpace(g.LastName) == "" {
		return errors.New("last name is required")
	}
	return nil
}

func (g *GoogleIDTokenRequest) Validate() error {
	if strings.TrimSpace(g.IDToken) == "" {
		return errors.New("id_token is required")
	}
	return nil
}

type GoogleOAuthExchangeRequest struct {
	Code string `json:"code" binding:"required"`
}

func (g *GoogleOAuthExchangeRequest) Validate() error {
	if strings.TrimSpace(g.Code) == "" {
		return errors.New("code is required")
	}
	return nil
}

type RefreshTokenRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

type UpdateProfileRequest struct {
	Username  *string `json:"username" binding:"omitempty,min=3,max=50"`
	FirstName *string `json:"firstName" binding:"omitempty,min=2,max=50"`
	LastName  *string `json:"lastName" binding:"omitempty,min=2,max=50"`
	Phone     *string `json:"phone" binding:"omitempty,min=10,max=20"`
	Avatar    *string `json:"avatar" binding:"omitempty"`
}

func (u *UpdateProfileRequest) Validate() error {
	// Validate username format if provided
	if u.Username != nil && *u.Username != "" {
		if len(*u.Username) < 3 || len(*u.Username) > 50 {
			return errors.New("username must be between 3 and 50 characters")
		}
	}

	// Validate phone format if provided
	if u.Phone != nil && *u.Phone != "" && !isValidPhone(*u.Phone) {
		return errors.New("phone number format is invalid")
	}

	// Avatar can be a URL or relative path, so we don't validate URL format strictly
	// The backend will handle relative paths correctly

	return nil
}

type AuthResponse struct {
	User         UserResponse `json:"user"`
	AccessToken  string       `json:"access_token"`
	RefreshToken string       `json:"refresh_token"`
	Message      string       `json:"message,omitempty"`
}

type UserResponse struct {
	ResourceID string            `json:"resource_id"`
	Username   string            `json:"username"`
	Email      string            `json:"email"`
	FirstName  string            `json:"first_name"`
	LastName   string            `json:"last_name"`
	Avatar     string            `json:"avatar"`
	IsAdmin    bool              `json:"is_admin"`
	IsVerified bool              `json:"is_verified"`
	Addresses  []AddressResponse `json:"addresses,omitempty"`
}

type TokenResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int    `json:"expires_in"`
}

// Common response structures
type SuccessResponse struct {
	Message string `json:"message"`
}

type ErrorResponse struct {
	Error   string `json:"error"`
	Message string `json:"message"`
}

// Helper validation functions

func isValidUsername(username string) bool {
	matched, _ := regexp.MatchString(`^[a-zA-Z0-9_]{3,50}$`, username)
	return matched
}

func isValidPassword(password string) bool {
	if len(password) < 8 {
		return false
	}

	hasUpper := regexp.MustCompile(`[A-Z]`).MatchString(password)
	hasLower := regexp.MustCompile(`[a-z]`).MatchString(password)
	hasNumber := regexp.MustCompile(`[0-9]`).MatchString(password)
	hasSpecial := regexp.MustCompile(`[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]`).MatchString(password)

	return hasUpper && hasLower && hasNumber && hasSpecial
}

func isValidPhone(phone string) bool {
	// Remove all non-digit characters
	phone = regexp.MustCompile(`\D`).ReplaceAllString(phone, "")
	// Check if it's 10-15 digits
	return len(phone) >= 10 && len(phone) <= 15
}

func isValidURL(url string) bool {
	matched, _ := regexp.MatchString(`^https?://[^\s/$.?#].[^\s]*$`, url)
	return matched
}

// OTP DTOs
type SendOTPRequest struct {
	Email string `json:"email" binding:"required,email"`
	Type  string `json:"type" binding:"required,oneof=email_verification password_reset login"`
}

type VerifyOTPRequest struct {
	Email    string `json:"email" binding:"required,email"`
	OTPCode  string `json:"otp_code" binding:"required,len=6"`
	Type     string `json:"type" binding:"required,oneof=email_verification password_reset login"`
}

type ResendOTPRequest struct {
	Email string `json:"email" binding:"required,email"`
	Type  string `json:"type" binding:"required,oneof=email_verification password_reset login"`
}

type PasswordResetRequest struct {
	Email           string `json:"email" binding:"required,email"`
	OTPCode         string `json:"otp_code" binding:"required,len=6"`
	NewPassword     string `json:"new_password" binding:"required,min=8"`
	ConfirmPassword string `json:"confirm_password" binding:"required,min=8"`
}

func (p *PasswordResetRequest) Validate() error {
	if p.NewPassword != p.ConfirmPassword {
		return errors.New("passwords do not match")
	}
	if !isValidPassword(p.NewPassword) {
		return errors.New("password must contain at least 8 characters with uppercase, lowercase, number, and special character")
	}
	return nil
}

type OTPResponse struct {
	Message   string `json:"message"`
	ExpiresIn int    `json:"expires_in"` // in seconds
}

type VerifyOTPResponse struct {
	Message      string `json:"message"`
	IsValid      bool   `json:"is_valid"`
	AccessToken  string `json:"access_token,omitempty"`
	RefreshToken string `json:"refresh_token,omitempty"`
}
