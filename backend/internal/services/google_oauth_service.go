package services

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
)

type GoogleOAuthService struct {
	clientID string
}

func (s *GoogleOAuthService) GetClientID() string {
	return s.clientID
}

func NewGoogleOAuthService(clientID string) *GoogleOAuthService {
	return &GoogleOAuthService{
		clientID: clientID,
	}
}

// GoogleUserInfo represents the user information from Google
type GoogleUserInfo struct {
	ID            string `json:"id"`
	Email         string `json:"email"`
	VerifiedEmail bool   `json:"verified_email"`
	Name          string `json:"name"`
	GivenName     string `json:"given_name"`
	FamilyName    string `json:"family_name"`
	Picture       string `json:"picture"`
}

// VerifyGoogleToken verifies a Google OAuth token and returns user information
func (s *GoogleOAuthService) VerifyGoogleToken(ctx context.Context, token string) (*GoogleUserInfo, error) {
	// Get user info from Google
	userInfo, err := s.getUserInfoFromGoogle(ctx, token)
	if err != nil {
		return nil, fmt.Errorf("failed to get user info: %w", err)
	}

	return userInfo, nil
}

// getUserInfoFromGoogle fetches user information from Google's userinfo endpoint
func (s *GoogleOAuthService) getUserInfoFromGoogle(ctx context.Context, token string) (*GoogleUserInfo, error) {
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	req, err := http.NewRequestWithContext(ctx, "GET", "https://www.googleapis.com/oauth2/v2/userinfo", nil)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Authorization", "Bearer "+token)

	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("Google API returned status %d", resp.StatusCode)
	}

	var userInfo GoogleUserInfo
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		return nil, err
	}

	return &userInfo, nil
}

// VerifyGoogleIDToken verifies a Google ID token (for web clients)
func (s *GoogleOAuthService) VerifyGoogleIDToken(ctx context.Context, idToken string) (*GoogleUserInfo, error) {
	// For now, we'll decode the JWT token manually
	// In production, you should verify the token signature with Google's public keys
	userInfo, err := s.decodeGoogleIDToken(idToken)
	if err != nil {
		return nil, fmt.Errorf("failed to decode ID token: %w", err)
	}

	return userInfo, nil
}

// decodeGoogleIDToken decodes a Google ID token (simplified version)
func (s *GoogleOAuthService) decodeGoogleIDToken(idToken string) (*GoogleUserInfo, error) {
	// This is a simplified implementation
	// In production, you should verify the JWT signature with Google's public keys
	// For now, we'll just decode the payload without verification
	
	// Split the JWT token
	parts := strings.Split(idToken, ".")
	if len(parts) != 3 {
		return nil, fmt.Errorf("invalid JWT token format")
	}

	// Decode the payload (middle part)
	payload := parts[1]
	
	// Add padding if needed
	for len(payload)%4 != 0 {
		payload += "="
	}

	// Decode base64
	decoded, err := base64.URLEncoding.DecodeString(payload)
	if err != nil {
		return nil, fmt.Errorf("failed to decode token payload: %w", err)
	}

	// Parse the JSON payload
	var claims map[string]interface{}
	if err := json.Unmarshal(decoded, &claims); err != nil {
		return nil, fmt.Errorf("failed to parse token claims: %w", err)
	}

	// Extract user information
	userInfo := &GoogleUserInfo{
		ID:            getString(claims, "sub"),
		Email:         getString(claims, "email"),
		VerifiedEmail: getBool(claims, "email_verified"),
		Name:          getString(claims, "name"),
		GivenName:     getString(claims, "given_name"),
		FamilyName:    getString(claims, "family_name"),
		Picture:       getString(claims, "picture"),
	}

	// Verify the audience (client ID)
	if aud, ok := claims["aud"].(string); ok && aud != s.clientID {
		return nil, fmt.Errorf("invalid token audience")
	}

	return userInfo, nil
}

// Helper functions
func getString(claims map[string]interface{}, key string) string {
	if val, ok := claims[key].(string); ok {
		return val
	}
	return ""
}

func getBool(claims map[string]interface{}, key string) bool {
	if val, ok := claims[key].(bool); ok {
		return val
	}
	return false
}
