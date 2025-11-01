package usecase

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"electronics-store/internal/dto"
	"electronics-store/internal/domain/models"
	"electronics-store/internal/repository"
	"electronics-store/internal/services"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

var (
	ErrUserAlreadyExists    = errors.New("user already exists")
	ErrInvalidCredentials   = errors.New("invalid credentials")
	ErrUserNotFound         = errors.New("user not found")
	ErrInvalidToken         = errors.New("invalid token")
)

type AuthUsecase interface {
	Register(ctx context.Context, req dto.RegisterRequest) (*models.User, *dto.TokenResponse, error)
	Login(ctx context.Context, req dto.LoginRequest) (*models.User, *dto.TokenResponse, error)
	GoogleAuth(ctx context.Context, req dto.GoogleAuthRequest) (*models.User, *dto.TokenResponse, error)
	GoogleIDTokenAuth(ctx context.Context, req dto.GoogleIDTokenRequest) (*models.User, *dto.TokenResponse, error)
	ExchangeGoogleCode(ctx context.Context, code string) (*models.User, *dto.TokenResponse, error)
	RefreshToken(ctx context.Context, refreshToken string) (*dto.TokenResponse, error)
	GetProfile(ctx context.Context, userID uint) (*models.User, error)
	UpdateProfile(ctx context.Context, userID uint, req dto.UpdateProfileRequest) (*models.User, error)
	GetUserByEmail(ctx context.Context, email string) (*models.User, error)
	UpdateUser(ctx context.Context, user *models.User) error
	GenerateTokens(user *models.User) (*dto.TokenResponse, error)
}

type authUsecase struct {
	userRepo        repository.UserRepository
	jwtSecret       string
	refreshSecret   string
	googleOAuthService *services.GoogleOAuthService
	googleClientSecret string
}

func NewAuthUsecase(userRepo repository.UserRepository, jwtSecret, refreshSecret string, googleOAuthService *services.GoogleOAuthService, googleClientSecret string) AuthUsecase {
	return &authUsecase{
		userRepo:   userRepo,
		jwtSecret:  jwtSecret,
		refreshSecret: refreshSecret,
		googleOAuthService: googleOAuthService,
		googleClientSecret: googleClientSecret,
	}
}

func (u *authUsecase) Register(ctx context.Context, req dto.RegisterRequest) (*models.User, *dto.TokenResponse, error) {
	// Check if user already exists
	existingUser, err := u.userRepo.GetByEmail(ctx, req.Email)
	if err != nil {
		return nil, nil, err
	}
	if existingUser != nil {
		return nil, nil, ErrUserAlreadyExists
	}

	// Check username
	existingUser, err = u.userRepo.GetByUsername(ctx, req.Username)
	if err != nil {
		return nil, nil, err
	}
	if existingUser != nil {
		return nil, nil, ErrUserAlreadyExists
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, nil, err
	}

	// Create user
	user := &models.User{
		Username:  req.Username,
		Email:     req.Email,
		Password:  string(hashedPassword),
		FirstName: req.FirstName,
		LastName:  req.LastName,
		Phone:     req.Phone,
		IsActive:  true,
		IsAdmin:   false,
	}

	err = u.userRepo.Create(ctx, user)
	if err != nil {
		return nil, nil, err
	}

	// Generate tokens
	tokens, err := u.generateTokens(user.ID)
	if err != nil {
		return nil, nil, err
	}

	return user, tokens, nil
}

func (u *authUsecase) Login(ctx context.Context, req dto.LoginRequest) (*models.User, *dto.TokenResponse, error) {
	// Get user by email
	user, err := u.userRepo.GetByEmail(ctx, req.Email)
	if err != nil {
		return nil, nil, err
	}
	if user == nil {
		return nil, nil, ErrInvalidCredentials
	}

	// Check password
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password))
	if err != nil {
		return nil, nil, ErrInvalidCredentials
	}

	// Check if user is active
	if !user.IsActive {
		return nil, nil, ErrInvalidCredentials
	}

	// Update last login
	now := time.Now()
	user.LastLoginAt = &now
	u.userRepo.Update(ctx, user)

	// Generate tokens
	tokens, err := u.generateTokens(user.ID)
	if err != nil {
		return nil, nil, err
	}

	return user, tokens, nil
}

func (u *authUsecase) GoogleAuth(ctx context.Context, req dto.GoogleAuthRequest) (*models.User, *dto.TokenResponse, error) {
	// Verify the Google token
	googleUserInfo, err := u.googleOAuthService.VerifyGoogleIDToken(ctx, req.GoogleID)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to verify Google token: %w", err)
	}

	// Check if user exists with Google ID
	user, err := u.userRepo.GetByGoogleID(ctx, googleUserInfo.ID)
	if err != nil {
		return nil, nil, err
	}

	if user == nil {
		// Check if user exists with the same email
		existingUser, err := u.userRepo.GetByEmail(ctx, googleUserInfo.Email)
		if err != nil {
			return nil, nil, err
		}
		if existingUser != nil {
			// Link Google account to existing user
			googleID := googleUserInfo.ID
			existingUser.GoogleID = &googleID
			existingUser.IsVerified = true
			if googleUserInfo.Picture != "" {
				existingUser.Avatar = googleUserInfo.Picture
			}
			user = existingUser
			err = u.userRepo.Update(ctx, user)
			if err != nil {
				return nil, nil, err
			}
		} else {
			// Generate username from email
			username := u.generateUsernameFromEmail(googleUserInfo.Email)
			
			// Ensure first and last names are not empty
			firstName := googleUserInfo.GivenName
			lastName := googleUserInfo.FamilyName
			if firstName == "" && googleUserInfo.Name != "" {
				// Split name if given_name is empty
				nameParts := strings.SplitN(googleUserInfo.Name, " ", 2)
				firstName = nameParts[0]
				if len(nameParts) > 1 {
					lastName = nameParts[1]
				} else {
					lastName = "User"
				}
			}
			if firstName == "" {
				firstName = "User"
			}
			if lastName == "" {
				lastName = "User"
			}
			
			// Create new user
			googleID := googleUserInfo.ID
			user = &models.User{
				GoogleID:   &googleID,
				Email:      googleUserInfo.Email,
				Username:   username,
				FirstName:  firstName,
				LastName:   lastName,
				Avatar:     googleUserInfo.Picture,
				IsActive:   true,
				IsAdmin:    false,
				IsVerified: true, // Google users are automatically verified
			}

			err = u.userRepo.Create(ctx, user)
			if err != nil {
				return nil, nil, err
			}
		}
	} else {
		// Update existing user info if needed
		if googleUserInfo.GivenName != "" {
			user.FirstName = googleUserInfo.GivenName
		}
		if googleUserInfo.FamilyName != "" {
			user.LastName = googleUserInfo.FamilyName
		}
		if googleUserInfo.Picture != "" {
			user.Avatar = googleUserInfo.Picture
		}
		user.IsVerified = true // Ensure Google users are verified
		
		err = u.userRepo.Update(ctx, user)
		if err != nil {
			return nil, nil, err
		}
	}

	// Update last login
	now := time.Now()
	user.LastLoginAt = &now
	u.userRepo.Update(ctx, user)

	// Generate tokens
	tokens, err := u.generateTokens(user.ID)
	if err != nil {
		return nil, nil, err
	}

	return user, tokens, nil
}

func (u *authUsecase) GoogleIDTokenAuth(ctx context.Context, req dto.GoogleIDTokenRequest) (*models.User, *dto.TokenResponse, error) {
	// Verify the Google ID token
	googleUserInfo, err := u.googleOAuthService.VerifyGoogleIDToken(ctx, req.IDToken)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to verify Google ID token: %w", err)
	}

	// Check if user exists with Google ID
	user, err := u.userRepo.GetByGoogleID(ctx, googleUserInfo.ID)
	if err != nil {
		return nil, nil, err
	}

	if user == nil {
		// Check if user exists with the same email
		existingUser, err := u.userRepo.GetByEmail(ctx, googleUserInfo.Email)
		if err != nil {
			return nil, nil, err
		}
		if existingUser != nil {
			// Link Google account to existing user
			googleID := googleUserInfo.ID
			existingUser.GoogleID = &googleID
			existingUser.IsVerified = true
			if googleUserInfo.Picture != "" {
				existingUser.Avatar = googleUserInfo.Picture
			}
			user = existingUser
			err = u.userRepo.Update(ctx, user)
			if err != nil {
				return nil, nil, err
			}
		} else {
			// Generate username from email
			username := u.generateUsernameFromEmail(googleUserInfo.Email)
			
			// Ensure first and last names are not empty
			firstName := googleUserInfo.GivenName
			lastName := googleUserInfo.FamilyName
			if firstName == "" && googleUserInfo.Name != "" {
				// Split name if given_name is empty
				nameParts := strings.SplitN(googleUserInfo.Name, " ", 2)
				firstName = nameParts[0]
				if len(nameParts) > 1 {
					lastName = nameParts[1]
				} else {
					lastName = "User"
				}
			}
			if firstName == "" {
				firstName = "User"
			}
			if lastName == "" {
				lastName = "User"
			}
			
			// Create new user
			googleID := googleUserInfo.ID
			user = &models.User{
				GoogleID:   &googleID,
				Email:      googleUserInfo.Email,
				Username:   username,
				FirstName:  firstName,
				LastName:   lastName,
				Avatar:     googleUserInfo.Picture,
				IsActive:   true,
				IsAdmin:    false,
				IsVerified: true, // Google users are automatically verified
			}

			err = u.userRepo.Create(ctx, user)
			if err != nil {
				return nil, nil, err
			}
		}
	} else {
		// Update existing user info if needed
		if googleUserInfo.GivenName != "" {
			user.FirstName = googleUserInfo.GivenName
		}
		if googleUserInfo.FamilyName != "" {
			user.LastName = googleUserInfo.FamilyName
		}
		if googleUserInfo.Picture != "" {
			user.Avatar = googleUserInfo.Picture
		}
		user.IsVerified = true // Ensure Google users are verified
		
		err = u.userRepo.Update(ctx, user)
		if err != nil {
			return nil, nil, err
		}
	}

	// Update last login
	now := time.Now()
	user.LastLoginAt = &now
	u.userRepo.Update(ctx, user)

	// Generate tokens
	tokens, err := u.generateTokens(user.ID)
	if err != nil {
		return nil, nil, err
	}

	return user, tokens, nil
}

func (u *authUsecase) ExchangeGoogleCode(ctx context.Context, code string) (*models.User, *dto.TokenResponse, error) {
	// Exchange the authorization code for an access token and ID token
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	// Exchange code for tokens
	tokenURL := "https://oauth2.googleapis.com/token"
	data := url.Values{}
	data.Set("code", code)
	data.Set("client_id", u.googleOAuthService.GetClientID())
	data.Set("client_secret", u.googleClientSecret)
	data.Set("redirect_uri", "http://localhost:3000/auth/google/callback") // Match frontend redirect route
	data.Set("grant_type", "authorization_code")

	resp, err := client.PostForm(tokenURL, data)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to exchange code: %w", err)
	}
	defer resp.Body.Close()

	var errorResponse map[string]interface{}
	if resp.StatusCode != http.StatusOK {
		// Try to read error response
		json.NewDecoder(resp.Body).Decode(&errorResponse)
		fmt.Printf("Google Token Exchange Error Response: %+v\n", errorResponse)
		return nil, nil, fmt.Errorf("failed to exchange code: status %d, error: %v", resp.StatusCode, errorResponse)
	}

	var tokenResponse struct {
		AccessToken  string `json:"access_token"`
		ExpiresIn    int    `json:"expires_in"`
		IDToken      string `json:"id_token"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&tokenResponse); err != nil {
		return nil, nil, fmt.Errorf("failed to decode token response: %w", err)
	}

	// Verify and decode the ID token
	googleUserInfo, err := u.googleOAuthService.VerifyGoogleIDToken(ctx, tokenResponse.IDToken)
	if err != nil {
		return nil, nil, fmt.Errorf("failed to verify ID token: %w", err)
	}

	// Now create/login user directly - similar to GoogleIDTokenAuth
	// Check if user exists with Google ID
	user, err := u.userRepo.GetByGoogleID(ctx, googleUserInfo.ID)
	if err != nil {
		return nil, nil, err
	}

	if user == nil {
		// Check if user exists with the same email
		existingUser, err := u.userRepo.GetByEmail(ctx, googleUserInfo.Email)
		if err != nil {
			return nil, nil, err
		}
		if existingUser != nil {
			// Link Google account to existing user
			googleID := googleUserInfo.ID
			existingUser.GoogleID = &googleID
			existingUser.IsVerified = true
			if googleUserInfo.Picture != "" {
				existingUser.Avatar = googleUserInfo.Picture
			}
			user = existingUser
			err = u.userRepo.Update(ctx, user)
			if err != nil {
				return nil, nil, err
			}
		} else {
			// Generate username from email
			username := u.generateUsernameFromEmail(googleUserInfo.Email)
			
			// Ensure first and last names are not empty
			firstName := googleUserInfo.GivenName
			lastName := googleUserInfo.FamilyName
			if firstName == "" && googleUserInfo.Name != "" {
				// Split name if given_name is empty
				nameParts := strings.SplitN(googleUserInfo.Name, " ", 2)
				firstName = nameParts[0]
				if len(nameParts) > 1 {
					lastName = nameParts[1]
				} else {
					lastName = "User"
				}
			}
			if firstName == "" {
				firstName = "User"
			}
			if lastName == "" {
				lastName = "User"
			}
			
			// Create new user
			googleID := googleUserInfo.ID
			user = &models.User{
				GoogleID:   &googleID,
				Email:      googleUserInfo.Email,
				Username:   username,
				FirstName:  firstName,
				LastName:   lastName,
				Avatar:     googleUserInfo.Picture,
				IsActive:   true,
				IsAdmin:    false,
				IsVerified: true, // Google users are automatically verified
			}

			err = u.userRepo.Create(ctx, user)
			if err != nil {
				return nil, nil, err
			}
		}
	} else {
		// Update existing user info if needed
		if googleUserInfo.GivenName != "" {
			user.FirstName = googleUserInfo.GivenName
		}
		if googleUserInfo.FamilyName != "" {
			user.LastName = googleUserInfo.FamilyName
		}
		if googleUserInfo.Picture != "" {
			user.Avatar = googleUserInfo.Picture
		}
		user.IsVerified = true // Ensure Google users are verified
		
		err = u.userRepo.Update(ctx, user)
		if err != nil {
			return nil, nil, err
		}
	}

	// Update last login
	now := time.Now()
	user.LastLoginAt = &now
	u.userRepo.Update(ctx, user)

	// Generate tokens
	tokens, err := u.generateTokens(user.ID)
	if err != nil {
		return nil, nil, err
	}

	return user, tokens, nil
}

func (u *authUsecase) RefreshToken(ctx context.Context, refreshToken string) (*dto.TokenResponse, error) {
	// Parse and verify the refresh token
	token, err := jwt.Parse(refreshToken, func(token *jwt.Token) (interface{}, error) {
		// Make sure token method is HS256
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrInvalidKey
		}
		return []byte(u.refreshSecret), nil
	})
	if err != nil || !token.Valid {
		return nil, errors.New("invalid refresh token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("invalid token claims")
	}

	userIDf, ok := claims["user_id"].(float64)
	if !ok {
		return nil, errors.New("user_id missing in token claims")
	}
	userID := uint(userIDf)

	// Optionally: check expiry and other claims
	// Now, generate new tokens for this user
	tokens, err := u.generateTokens(userID)
	if err != nil {
		return nil, err
	}
	return tokens, nil
}

func (u *authUsecase) GetProfile(ctx context.Context, userID uint) (*models.User, error) {
	user, err := u.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, ErrUserNotFound
	}
	return user, nil
}

func (u *authUsecase) UpdateProfile(ctx context.Context, userID uint, req dto.UpdateProfileRequest) (*models.User, error) {
	user, err := u.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, ErrUserNotFound
	}

	// Update fields
	if req.FirstName != nil {
		user.FirstName = *req.FirstName
	}
	if req.LastName != nil {
		user.LastName = *req.LastName
	}
	if req.Phone != nil {
		user.Phone = *req.Phone
	}
	if req.Avatar != nil {
		user.Avatar = *req.Avatar
	}

	err = u.userRepo.Update(ctx, user)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (u *authUsecase) generateTokens(userID uint) (*dto.TokenResponse, error) {
    // Load user to embed role claims
    user, err := u.userRepo.GetByID(context.Background(), userID)
    if err != nil || user == nil {
        return nil, errors.New("user not found for token generation")
    }

    // Create access token with admin claim
    accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
        "user_id":  userID,
        "is_admin": user.IsAdmin,
        "exp":      time.Now().Add(time.Hour).Unix(),
        "iat":      time.Now().Unix(),
        "type":     "access",
    })

	accessTokenString, err := accessToken.SignedString([]byte(u.jwtSecret))
	if err != nil {
		return nil, err
	}

	// Create refresh token
    refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
        "user_id":  userID,
        "is_admin": user.IsAdmin,
        "exp":      time.Now().Add(7 * 24 * time.Hour).Unix(), // 7 days
        "iat":      time.Now().Unix(),
        "type":     "refresh",
    })

	refreshTokenString, err := refreshToken.SignedString([]byte(u.refreshSecret))
	if err != nil {
		return nil, err
	}

	return &dto.TokenResponse{
		AccessToken:  accessTokenString,
		RefreshToken: refreshTokenString,
		ExpiresIn:    3600, // 1 hour
	}, nil
}

func generateRandomToken(length int) (string, error) {
	bytes := make([]byte, length)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}

// GetUserByEmail gets a user by email
func (u *authUsecase) GetUserByEmail(ctx context.Context, email string) (*models.User, error) {
	user, err := u.userRepo.GetByEmail(ctx, email)
	if err != nil {
		return nil, err
	}
	if user == nil {
		return nil, ErrUserNotFound
	}
	return user, nil
}

// UpdateUser updates a user
func (u *authUsecase) UpdateUser(ctx context.Context, user *models.User) error {
	return u.userRepo.Update(ctx, user)
}

// GenerateTokens generates tokens for a user
func (u *authUsecase) GenerateTokens(user *models.User) (*dto.TokenResponse, error) {
	return u.generateTokens(user.ID)
}

// generateUsernameFromEmail generates a username from an email address
func (u *authUsecase) generateUsernameFromEmail(email string) string {
	// Extract the part before @
	parts := strings.Split(email, "@")
	if len(parts) == 0 {
		return "user_" + fmt.Sprintf("%d", time.Now().Unix())
	}
	
	// Use the part before @ as username
	username := parts[0]
	
	// Remove any special characters and make it alphanumeric with underscores
	username = strings.ToLower(username)
	username = strings.ReplaceAll(username, ".", "_")
	username = strings.ReplaceAll(username, "-", "_")
	username = strings.ReplaceAll(username, "+", "_")
	
	// Add timestamp if needed to ensure uniqueness
	// For now, just use the email part
	if len(username) < 3 {
		username = username + "_" + fmt.Sprintf("%d", time.Now().Unix())
	}
	
	return username
}
