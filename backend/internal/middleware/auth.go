package middleware

import (
    "net/http"
    "strings"

    "github.com/gin-gonic/gin"
    "github.com/golang-jwt/jwt/v5"
    "electronics-store/internal/dto"
)

// AuthMiddleware validates JWT token and sets user_id in context
func AuthMiddleware(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
        // Prefer Authorization header; fallback to access_token cookie
        authHeader := c.GetHeader("Authorization")
        var tokenString string
        if authHeader != "" {
            // Check if header starts with "Bearer "
            tokenString = strings.TrimPrefix(authHeader, "Bearer ")
            if tokenString == authHeader {
                c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
                    Error:   "Unauthorized",
                    Message: "Invalid authorization header format",
                })
                c.Abort()
                return
            }
        } else {
            // Try cookie fallback for browser-based auth
            if cookieToken, err := c.Cookie("access_token"); err == nil {
                tokenString = cookieToken
            } else {
                c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
                    Error:   "Unauthorized",
                    Message: "Authorization required",
                })
                c.Abort()
                return
            }
        }

		// Parse and validate token
		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			// Validate signing method
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return []byte(jwtSecret), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
				Error:   "Unauthorized",
				Message: "Invalid token",
			})
			c.Abort()
			return
		}

		// Extract claims
		claims, ok := token.Claims.(jwt.MapClaims)
        if !ok {
			c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
				Error:   "Unauthorized",
				Message: "Invalid token claims",
			})
			c.Abort()
			return
		}

        // Get user_id from claims
        userID, ok := claims["user_id"].(float64)
		if !ok {
			c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
				Error:   "Unauthorized",
				Message: "Invalid user ID in token",
			})
			c.Abort()
			return
		}

        // Set user_id and is_admin in context
        c.Set("user_id", uint(userID))
        if isAdmin, ok := claims["is_admin"].(bool); ok {
            c.Set("is_admin", isAdmin)
        }
		c.Next()
	}
}

// AdminOnly ensures the user is authenticated and has admin privileges
func AdminOnly(jwtSecret string) gin.HandlerFunc {
    base := AuthMiddleware(jwtSecret)
    return func(c *gin.Context) {
        base(c)
        if c.IsAborted() {
            return
        }
        if val, exists := c.Get("is_admin"); !exists || val != true {
            c.JSON(http.StatusForbidden, dto.ErrorResponse{ Error: "Forbidden", Message: "Admin access required" })
            c.Abort()
            return
        }
    }
}
