package handlers

import (
	"electronics-store/internal/dto"
	"electronics-store/internal/services"
	"electronics-store/internal/usecase"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	authUsecase usecase.AuthUsecase
	otpService  *services.OTPService
}

func NewAuthHandler(authUsecase usecase.AuthUsecase, otpService *services.OTPService) *AuthHandler {
	return &AuthHandler{
		authUsecase: authUsecase,
		otpService:  otpService,
	}
}

// Register godoc
// @Summary Register a new user
// @Description Register a new user with email and password
// @Tags auth
// @Accept json
// @Produce json
// @Param request body dto.RegisterRequest true "Register request"
// @Success 201 {object} dto.AuthResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 409 {object} dto.ErrorResponse
// @Router /auth/register [post]
func (h *AuthHandler) Register(c *gin.Context) {
	var req dto.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: err.Error(),
		})
		return
	}

	// Validate request
	if err := req.Validate(); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Validation failed",
			Message: err.Error(),
		})
		return
	}

	// Register user
	user, tokens, err := h.authUsecase.Register(c.Request.Context(), req)
	if err != nil {
		status := http.StatusInternalServerError
		if err == usecase.ErrUserAlreadyExists {
			status = http.StatusConflict
		}
		c.JSON(status, dto.ErrorResponse{
			Error:   "Registration failed",
			Message: err.Error(),
		})
		return
	}

	// Send OTP for email verification
	_, err = h.otpService.SendOTP(user.Email, "email_verification", &user.ID)
	if err != nil {
		// Log error but don't fail registration
		// In production, you might want to handle this differently
	}

    // Set HTTP-only cookies (Secure=false for local dev; ensure HTTPS in production)
    c.SetCookie("access_token", tokens.AccessToken, 15*60, "/", "", false, true)
    c.SetCookie("refresh_token", tokens.RefreshToken, 7*24*60*60, "/", "", false, true)

	c.JSON(http.StatusCreated, dto.AuthResponse{
		User: dto.UserResponse{
			ResourceID: user.ResourceID,
			Username:   user.Username,
			Email:      user.Email,
			FirstName:  user.FirstName,
			LastName:   user.LastName,
			Avatar:     user.Avatar,
			IsAdmin:    user.IsAdmin,
			IsVerified: user.IsVerified,
		},
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
		Message:      "Registration successful! Please check your email for verification code.",
	})
}

// Login godoc
// @Summary Login user
// @Description Login user with email and password
// @Tags auth
// @Accept json
// @Produce json
// @Param request body dto.LoginRequest true "Login request"
// @Success 200 {object} dto.AuthResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Router /auth/login [post]
func (h *AuthHandler) Login(c *gin.Context) {
	var req dto.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: err.Error(),
		})
		return
	}

	// Validate request
	if err := req.Validate(); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Validation failed",
			Message: err.Error(),
		})
		return
	}

	// Login user
	user, tokens, err := h.authUsecase.Login(c.Request.Context(), req)
	if err != nil {
		status := http.StatusInternalServerError
		if err == usecase.ErrInvalidCredentials {
			status = http.StatusUnauthorized
		}
		c.JSON(status, dto.ErrorResponse{
			Error:   "Login failed",
			Message: err.Error(),
		})
		return
	}

    // Set HTTP-only cookies (Secure=false for local dev; ensure HTTPS in production)
    c.SetCookie("access_token", tokens.AccessToken, 15*60, "/", "", false, true)
    c.SetCookie("refresh_token", tokens.RefreshToken, 7*24*60*60, "/", "", false, true)

	c.JSON(http.StatusOK, dto.AuthResponse{
		User: dto.UserResponse{
			ResourceID: user.ResourceID,
			Username:   user.Username,
			Email:      user.Email,
			FirstName:  user.FirstName,
			LastName:   user.LastName,
			Avatar:     user.Avatar,
			IsAdmin:    user.IsAdmin,
		},
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
	})
}

// GoogleAuth godoc
// @Summary Google OAuth login
// @Description Login with Google OAuth
// @Tags auth
// @Accept json
// @Produce json
// @Param request body dto.GoogleAuthRequest true "Google auth request"
// @Success 200 {object} dto.AuthResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Router /auth/google [post]
func (h *AuthHandler) GoogleAuth(c *gin.Context) {
	var req dto.GoogleAuthRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: err.Error(),
		})
		return
	}


	// Validate request
	if err := req.Validate(); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Validation failed",
			Message: err.Error(),
		})
		return
	}

	// Google OAuth login
	user, tokens, err := h.authUsecase.GoogleAuth(c.Request.Context(), req)
	if err != nil {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error:   "Google authentication failed",
			Message: err.Error(),
		})
		return
	}

	// Set HTTP-only cookies (Secure=false for local dev; ensure HTTPS in production)
	c.SetCookie("access_token", tokens.AccessToken, 15*60, "/", "", false, true)
	c.SetCookie("refresh_token", tokens.RefreshToken, 7*24*60*60, "/", "", false, true)

	c.JSON(http.StatusOK, dto.AuthResponse{
		User: dto.UserResponse{
			ResourceID: user.ResourceID,
			Username:   user.Username,
			Email:      user.Email,
			FirstName:  user.FirstName,
			LastName:   user.LastName,
			Avatar:     user.Avatar,
			IsAdmin:    user.IsAdmin,
			IsVerified: user.IsVerified,
		},
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
	})
}

// GoogleIDTokenAuth godoc
// @Summary Google ID Token authentication
// @Description Authenticate using Google ID token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body dto.GoogleIDTokenRequest true "Google ID token request"
// @Success 200 {object} dto.AuthResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Router /auth/google/id-token [post]
func (h *AuthHandler) GoogleIDTokenAuth(c *gin.Context) {
	var req dto.GoogleIDTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		fmt.Printf("Google OAuth Error - Invalid request: %v\n", err)
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: err.Error(),
		})
		return
	}

	// Validate request
	if err := req.Validate(); err != nil {
		fmt.Printf("Google OAuth Error - Validation failed: %v\n", err)
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Validation failed",
			Message: err.Error(),
		})
		return
	}

	fmt.Printf("Google OAuth - Received ID token: %s\n", req.IDToken[:50]+"...")

	// Google ID Token authentication
	user, tokens, err := h.authUsecase.GoogleIDTokenAuth(c.Request.Context(), req)
	if err != nil {
		fmt.Printf("Google OAuth Error - Authentication failed: %v\n", err)
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error:   "Google authentication failed",
			Message: err.Error(),
		})
		return
	}

	fmt.Printf("Google OAuth Success - User: %s, Email: %s\n", user.Username, user.Email)

    // Set HTTP-only cookies (Secure=false for local dev; ensure HTTPS in production)
    c.SetCookie("access_token", tokens.AccessToken, 15*60, "/", "", false, true)
    c.SetCookie("refresh_token", tokens.RefreshToken, 7*24*60*60, "/", "", false, true)

	c.JSON(http.StatusOK, dto.AuthResponse{
		User: dto.UserResponse{
			ResourceID: user.ResourceID,
			Username:   user.Username,
			Email:      user.Email,
			FirstName:  user.FirstName,
			LastName:   user.LastName,
			Avatar:     user.Avatar,
			IsAdmin:    user.IsAdmin,
			IsVerified: user.IsVerified,
		},
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
	})
}

// GoogleOAuthExchange godoc
// @Summary Exchange Google OAuth code for user info
// @Description Exchange Google OAuth authorization code for user information
// @Tags auth
// @Accept json
// @Produce json
// @Param request body dto.GoogleOAuthExchangeRequest true "Google OAuth exchange request"
// @Success 200 {object} dto.GoogleAuthRequest
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Router /auth/google/exchange [post]
func (h *AuthHandler) GoogleOAuthExchange(c *gin.Context) {
	var req dto.GoogleOAuthExchangeRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: err.Error(),
		})
		return
	}

	// Exchange code for tokens and authenticate
	fmt.Printf("Google OAuth Exchange - Received code: %s\n", req.Code[:20]+"...")
	user, tokens, err := h.authUsecase.ExchangeGoogleCode(c.Request.Context(), req.Code)
	if err != nil {
		fmt.Printf("Google OAuth Exchange Error: %v\n", err)
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error:   "Google OAuth exchange failed",
			Message: err.Error(),
		})
		return
	}
	
	fmt.Printf("Google OAuth Exchange Success - User: %s\n", user.Email)
	
	// Return full auth response
	c.JSON(http.StatusOK, dto.AuthResponse{
		User: dto.UserResponse{
			ResourceID: user.ResourceID,
			Username:   user.Username,
			Email:      user.Email,
			FirstName:  user.FirstName,
			LastName:   user.LastName,
			Avatar:     user.Avatar,
			IsAdmin:    user.IsAdmin,
			IsVerified: user.IsVerified,
		},
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
	})
}

// RefreshToken godoc
// @Summary Refresh access token
// @Description Refresh access token using refresh token
// @Tags auth
// @Accept json
// @Produce json
// @Param request body dto.RefreshTokenRequest true "Refresh token request"
// @Success 200 {object} dto.AuthResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Router /auth/refresh [post]
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var req dto.RefreshTokenRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: err.Error(),
		})
		return
	}

	// Refresh token
	tokens, err := h.authUsecase.RefreshToken(c.Request.Context(), req.RefreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error:   "Token refresh failed",
			Message: err.Error(),
		})
		return
	}

    // Set HTTP-only cookies (Secure=false for local dev; ensure HTTPS in production)
    c.SetCookie("access_token", tokens.AccessToken, 15*60, "/", "", false, true)
    c.SetCookie("refresh_token", tokens.RefreshToken, 7*24*60*60, "/", "", false, true)

	c.JSON(http.StatusOK, dto.AuthResponse{
		AccessToken:  tokens.AccessToken,
		RefreshToken: tokens.RefreshToken,
	})
}

// Logout godoc
// @Summary Logout user
// @Description Logout user and invalidate tokens
// @Tags auth
// @Accept json
// @Produce json
// @Success 200 {object} dto.SuccessResponse
// @Router /auth/logout [post]
func (h *AuthHandler) Logout(c *gin.Context) {
    // Clear cookies
    c.SetCookie("access_token", "", -1, "/", "", false, true)
    c.SetCookie("refresh_token", "", -1, "/", "", false, true)

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Message: "Logged out successfully",
	})
}

// GetProfile godoc
// @Summary Get user profile
// @Description Get current user profile
// @Tags auth
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} dto.UserResponse
// @Failure 401 {object} dto.ErrorResponse
// @Router /auth/profile [get]
func (h *AuthHandler) GetProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error:   "Unauthorized",
			Message: "User not authenticated",
		})
		return
	}

	user, err := h.authUsecase.GetProfile(c.Request.Context(), userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to get profile",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.UserResponse{
		ResourceID: user.ResourceID,
		Username:   user.Username,
		Email:      user.Email,
		FirstName:  user.FirstName,
		LastName:   user.LastName,
		Avatar:     user.Avatar,
		IsAdmin:    user.IsAdmin,
		IsVerified: user.IsVerified,
	})
}

// Me godoc
// @Summary Get current user
// @Description Get current authenticated user profile (alternative to /profile)
// @Tags auth
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} dto.UserResponse
// @Failure 401 {object} dto.ErrorResponse
// @Router /me [get]
func (h *AuthHandler) Me(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error:   "Unauthorized",
			Message: "User not authenticated",
		})
		return
	}

	user, err := h.authUsecase.GetProfile(c.Request.Context(), userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to get user profile",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.UserResponse{
		ResourceID: user.ResourceID,
		Username:   user.Username,
		Email:      user.Email,
		FirstName:  user.FirstName,
		LastName:   user.LastName,
		Avatar:     user.Avatar,
		IsAdmin:    user.IsAdmin,
		IsVerified: user.IsVerified,
	})
}

// UpdateProfile godoc
// @Summary Update user profile
// @Description Update current user profile
// @Tags auth
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body dto.UpdateProfileRequest true "Update profile request"
// @Success 200 {object} dto.UserResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Router /auth/profile [put]
func (h *AuthHandler) UpdateProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error:   "Unauthorized",
			Message: "User not authenticated",
		})
		return
	}

	var req dto.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: err.Error(),
		})
		return
	}

	// Validate request
	if err := req.Validate(); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Validation failed",
			Message: err.Error(),
		})
		return
	}

	// Update profile
	user, err := h.authUsecase.UpdateProfile(c.Request.Context(), userID.(uint), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to update profile",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.UserResponse{
		ResourceID: user.ResourceID,
		Username:   user.Username,
		Email:      user.Email,
		FirstName:  user.FirstName,
		LastName:   user.LastName,
		Avatar:     user.Avatar,
		IsAdmin:    user.IsAdmin,
	})
}

// SendOTP godoc
// @Summary Send OTP for verification
// @Description Send OTP to user's email for verification
// @Tags auth
// @Accept json
// @Produce json
// @Param request body dto.SendOTPRequest true "Send OTP request"
// @Success 200 {object} dto.OTPResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /auth/send-otp [post]
func (h *AuthHandler) SendOTP(c *gin.Context) {
	var req dto.SendOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: err.Error(),
		})
		return
	}

	// Send OTP
	_, err := h.otpService.SendOTP(req.Email, req.Type, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to send OTP",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.OTPResponse{
		Message:   "OTP sent successfully",
		ExpiresIn: 900, // 15 minutes
	})
}

// VerifyOTP godoc
// @Summary Verify OTP code
// @Description Verify OTP code for email verification or login
// @Tags auth
// @Accept json
// @Produce json
// @Param request body dto.VerifyOTPRequest true "Verify OTP request"
// @Success 200 {object} dto.VerifyOTPResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Router /auth/verify-otp [post]
func (h *AuthHandler) VerifyOTP(c *gin.Context) {
	var req dto.VerifyOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: err.Error(),
		})
		return
	}

	// Verify OTP
	_, err := h.otpService.VerifyOTP(req.Email, req.OTPCode, req.Type)
	if err != nil {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error:   "Invalid OTP",
			Message: err.Error(),
		})
		return
	}

	// Handle different OTP types
	switch req.Type {
	case "email_verification":
		// Get user by email and mark as verified
		user, err := h.authUsecase.GetUserByEmail(c.Request.Context(), req.Email)
		if err != nil {
			c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Error:   "User not found",
				Message: err.Error(),
			})
			return
		}

		// Mark user as verified
		user.IsVerified = true
		if err := h.authUsecase.UpdateUser(c.Request.Context(), user); err != nil {
			c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Error:   "Failed to update user",
				Message: err.Error(),
			})
			return
		}

		// Generate new tokens for verified user
		tokens, err := h.authUsecase.GenerateTokens(user)
		if err != nil {
			c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
				Error:   "Failed to generate tokens",
				Message: err.Error(),
			})
			return
		}

        // Set HTTP-only cookies (Secure=false for local dev; ensure HTTPS in production)
        c.SetCookie("access_token", tokens.AccessToken, 15*60, "/", "", false, true)
        c.SetCookie("refresh_token", tokens.RefreshToken, 7*24*60*60, "/", "", false, true)

		c.JSON(http.StatusOK, dto.AuthResponse{
			User: dto.UserResponse{
				ResourceID: user.ResourceID,
				Username:   user.Username,
				Email:      user.Email,
				FirstName:  user.FirstName,
				LastName:   user.LastName,
				Avatar:     user.Avatar,
				IsAdmin:    user.IsAdmin,
				IsVerified: user.IsVerified,
			},
			AccessToken:  tokens.AccessToken,
			RefreshToken: tokens.RefreshToken,
			Message:      "Email verified successfully",
		})

	case "login":
		// For OTP login, we would generate tokens here
		// For now, just return success
		c.JSON(http.StatusOK, dto.VerifyOTPResponse{
			Message: "OTP verified successfully. Please use regular login.",
			IsValid: true,
		})

	default:
		c.JSON(http.StatusOK, dto.VerifyOTPResponse{
			Message: "OTP verified successfully",
			IsValid: true,
		})
	}
}

// ResendOTP godoc
// @Summary Resend OTP
// @Description Resend OTP to user's email
// @Tags auth
// @Accept json
// @Produce json
// @Param request body dto.ResendOTPRequest true "Resend OTP request"
// @Success 200 {object} dto.OTPResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /auth/resend-otp [post]
func (h *AuthHandler) ResendOTP(c *gin.Context) {
	var req dto.ResendOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: err.Error(),
		})
		return
	}

	// Resend OTP
	_, err := h.otpService.ResendOTP(req.Email, req.Type, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to resend OTP",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.OTPResponse{
		Message:   "OTP resent successfully",
		ExpiresIn: 900, // 15 minutes
	})
}

// ForgotPassword godoc
// @Summary Request password reset
// @Description Send OTP to email for password reset
// @Tags auth
// @Accept json
// @Produce json
// @Param request body dto.SendOTPRequest true "Send OTP for password reset"
// @Success 200 {object} dto.OTPResponse
// @Failure 400 {object} dto.ErrorResponse
// @Router /auth/forgot-password [post]
func (h *AuthHandler) ForgotPassword(c *gin.Context) {
	var req dto.SendOTPRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: err.Error(),
		})
		return
	}
	if req.Email == "" {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Validation failed",
			Message: "Email is required",
		})
		return
	}

	user, err := h.authUsecase.GetUserByEmail(c.Request.Context(), req.Email)
	if err != nil || user == nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{
			Error:   "Not Found",
			Message: "No account is registered with that email.",
		})
		return
	}
	// send OTP
	_, _ = h.otpService.SendOTP(req.Email, "password_reset", nil)
	c.JSON(http.StatusOK, dto.OTPResponse{
		Message:   "Password reset OTP sent successfully",
		ExpiresIn: 900,
	})
}

// PasswordReset godoc
// @Summary Reset password with OTP
// @Description Reset user password using OTP verification
// @Tags auth
// @Accept json
// @Produce json
// @Param request body dto.PasswordResetRequest true "Password reset request"
// @Success 200 {object} dto.SuccessResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Router /auth/password-reset [post]
func (h *AuthHandler) PasswordReset(c *gin.Context) {
	var req dto.PasswordResetRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: err.Error(),
		})
		return
	}
	// Validate
	if err := req.Validate(); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Validation failed",
			Message: err.Error(),
		})
		return
	}
	// Verify OTP
	_, err := h.otpService.VerifyOTP(req.Email, req.OTPCode, "password_reset")
	if err != nil {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error:   "Invalid OTP",
			Message: err.Error(),
		})
		return
	}
	// Update user password
	user, err := h.authUsecase.GetUserByEmail(c.Request.Context(), req.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to find user",
			Message: err.Error(),
		})
		return
	}
	hashedPw, hashErr := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if hashErr != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to hash password",
			Message: hashErr.Error(),
		})
		return
	}
	user.Password = string(hashedPw)
	err = h.authUsecase.UpdateUser(c.Request.Context(), user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to update password",
			Message: err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, dto.SuccessResponse{
		Message: "Password reset successfully. You can now log in with your new password.",
	})
}
