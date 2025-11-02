package api

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"electronics-store/internal/api/handlers"
	"electronics-store/internal/config"
	"electronics-store/internal/database"
	"electronics-store/internal/middleware"
	"electronics-store/internal/repository"
	"electronics-store/internal/services"
	"electronics-store/internal/usecase"

	"github.com/gin-gonic/gin"
)

type Server struct {
	config *config.Config
	db     *database.Connection
	router *gin.Engine
}

func NewServer(cfg *config.Config, db *database.Connection) *Server {
	// Set Gin mode
	if cfg.Server.Host == "localhost" {
		gin.SetMode(gin.DebugMode)
	} else {
		gin.SetMode(gin.ReleaseMode)
	}

	router := gin.New()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	// CORS middleware
	router.Use(func(c *gin.Context) {
		origin := c.GetHeader("Origin")
		// Allow your frontend origin explicitly (adjust if different)
		allowedOrigin := "http://localhost:3000"
		if origin == allowedOrigin {
			c.Header("Access-Control-Allow-Origin", allowedOrigin)
		}
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Origin, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
		
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		
		c.Next()
	})

	server := &Server{
		config: cfg,
		db:     db,
		router: router,
	}

	server.setupRoutes()
	return server
}

func (s *Server) setupRoutes() {
	// Initialize repositories
    userRepo := repository.NewUserRepository(s.db.DB)
    productRepo := repository.NewProductRepository(s.db.DB)
    categoryRepo := repository.NewCategoryRepository(s.db.DB)
	orderRepo := repository.NewOrderRepository(s.db.DB)
	otpRepo := repository.NewOTPRepository(s.db.DB)
	reviewRepo := repository.NewReviewRepository(s.db.DB)

	// Initialize services
	emailService := services.NewEmailService(&s.config.Email)
	otpService := services.NewOTPService(otpRepo, emailService)
	googleOAuthService := services.NewGoogleOAuthService(s.config.OAuth.GoogleClientID)

	// Initialize usecases
	authUsecase := usecase.NewAuthUsecase(userRepo, s.config.JWT.AccessTokenSecret, s.config.JWT.RefreshTokenSecret, googleOAuthService, s.config.OAuth.GoogleClientSecret)
    productUsecase := usecase.NewProductUsecase(productRepo)
    categoryUsecase := usecase.NewCategoryUsecase(categoryRepo, productUsecase)
	orderUsecase := usecase.NewOrderUsecase(orderRepo)
	reviewUsecase := usecase.NewReviewUsecase(reviewRepo)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authUsecase, otpService)
    productHandler := handlers.NewProductHandler(productUsecase)
    categoryHandler := handlers.NewCategoryHandler(categoryUsecase, productUsecase)
	orderHandler := handlers.NewOrderHandler(orderUsecase)
	cartHandler := handlers.NewCartHandler(s.db.DB)
	wishlistHandler := handlers.NewWishlistHandler(s.db.DB)
	reviewHandler := handlers.NewReviewHandler(reviewUsecase, productRepo)
	
	// Initialize search handler
	brandRepo := repository.NewBrandRepository(s.db.DB)
	searchHandler := handlers.NewSearchHandler(productRepo, categoryRepo, brandRepo, s.db.DB)
	
	// Initialize upload handler
	uploadDir := "./uploads"
	baseURL := fmt.Sprintf("http://%s:%s", s.config.Server.Host, s.config.Server.Port)
	if s.config.Server.Host == "localhost" || s.config.Server.Host == "127.0.0.1" {
		baseURL = fmt.Sprintf("http://localhost:%s", s.config.Server.Port)
	}
	uploadHandler := handlers.NewUploadHandler(uploadDir, baseURL)

	// API routes
	api := s.router.Group("/api/v1")
	{
		// Auth routes
		auth := api.Group("/auth")
		{
			auth.POST("/register", authHandler.Register)
			auth.POST("/login", authHandler.Login)
			auth.POST("/google", authHandler.GoogleAuth)
			auth.POST("/google/id-token", authHandler.GoogleIDTokenAuth)
			auth.POST("/google/exchange", authHandler.GoogleOAuthExchange)
			auth.POST("/refresh", authHandler.RefreshToken)
			auth.POST("/logout", authHandler.Logout)
			auth.GET("/profile", middleware.AuthMiddleware(s.config.JWT.AccessTokenSecret), authHandler.GetProfile)
			auth.PUT("/profile", middleware.AuthMiddleware(s.config.JWT.AccessTokenSecret), authHandler.UpdateProfile)
			
			// OTP routes
			auth.POST("/send-otp", authHandler.SendOTP)
			auth.POST("/verify-otp", authHandler.VerifyOTP)
			auth.POST("/resend-otp", authHandler.ResendOTP)
			auth.POST("/password-reset", authHandler.PasswordReset)
			auth.POST("/forgot-password", authHandler.ForgotPassword)
		}

		// Me route (alternative to /auth/profile)
		api.GET("/me", middleware.AuthMiddleware(s.config.JWT.AccessTokenSecret), authHandler.Me)

		// Product routes
		products := api.Group("/products")
		{
			products.GET("", productHandler.List)
			products.GET("/search", productHandler.Search)
			products.GET("/featured", productHandler.GetFeatured)
			products.GET("/category/:categoryId", productHandler.GetByCategory)
			products.GET("/:id", productHandler.GetByID)
			products.GET("/:id/related", productHandler.GetRelatedProducts)
			products.GET("/:id/reviews", reviewHandler.GetProductReviews)
		}

        // Category routes
        categories := api.Group("/categories")
        {
            categories.GET("", categoryHandler.List)
            categories.GET(":slug", categoryHandler.GetBySlug)
        }

		// Brands routes (public)
		api.GET("/brands", productHandler.GetBrands)
		api.GET("/search/suggest", productHandler.SuggestProducts)
		
		// Comprehensive search (public)
		api.GET("/search", searchHandler.Search)

		// Review routes
		reviews := api.Group("/reviews")
		{
			// Public routes
			// GET /products/:productId/reviews is handled above

			// Protected routes (require authentication)
			reviews.Use(middleware.AuthMiddleware(s.config.JWT.AccessTokenSecret))
			reviews.POST("", reviewHandler.CreateReview)
			reviews.GET("/my", reviewHandler.GetUserReviews)
			reviews.PUT("/:id", reviewHandler.UpdateReview)
			reviews.DELETE("/:id", reviewHandler.DeleteReview)
			
			// Reply routes
			reviews.POST("/replies", reviewHandler.CreateReply)
			reviews.DELETE("/replies/:id", reviewHandler.DeleteReply)
		}

		// Admin routes (protected by admin middleware)
		admin := api.Group("/admin")
		admin.Use(middleware.AdminOnly(s.config.JWT.AccessTokenSecret))
		{
			admin.GET("/health", func(c *gin.Context) {
				c.JSON(http.StatusOK, gin.H{"status": "ok"})
			})

			// Initialize admin handlers
			adminAnalyticsHandler := handlers.NewAdminAnalyticsHandler(s.db)
			adminProductsHandler := handlers.NewAdminProductsHandler(productUsecase, productRepo, categoryRepo, s.db.DB)
			adminOrdersHandler := handlers.NewAdminOrdersHandler(orderRepo)
			adminUsersHandler := handlers.NewAdminUsersHandler(userRepo, orderRepo)
			adminCategoriesHandler := handlers.NewAdminCategoriesHandler(categoryRepo)
			brandRepo := repository.NewBrandRepository(s.db.DB)
			adminBrandsHandler := handlers.NewAdminBrandsHandler(brandRepo)
			adminSearchHandler := handlers.NewAdminSearchHandler(productRepo, orderRepo, userRepo, categoryRepo, brandRepo, s.db.DB)

			// Search route (should be before other routes to avoid conflicts)
			admin.GET("/search", adminSearchHandler.Search)

			// Analytics routes
			analytics := admin.Group("/analytics")
			{
				analytics.GET("/dashboard", adminAnalyticsHandler.GetDashboard)
				analytics.GET("/sales", adminAnalyticsHandler.GetSalesData)
				analytics.GET("/top-products", adminAnalyticsHandler.GetTopProducts)
			}

			// Products management routes
			products := admin.Group("/products")
			{
				products.GET("", adminProductsHandler.ListProducts)
				products.GET("/:id", adminProductsHandler.GetProduct)
				products.POST("", adminProductsHandler.CreateProduct)
				products.PUT("/:id", adminProductsHandler.UpdateProduct)
				products.DELETE("/:id", adminProductsHandler.DeleteProduct)
			}

			// Orders management routes
			orders := admin.Group("/orders")
			{
				orders.GET("", adminOrdersHandler.ListOrders)
				orders.PUT("/:id/status", adminOrdersHandler.UpdateOrderStatus)
			}

			// Users/Customers management routes
			users := admin.Group("/users")
			{
				users.GET("", adminUsersHandler.ListUsers)
				users.GET("/:id", adminUsersHandler.GetUser)
				users.PUT("/:id", adminUsersHandler.UpdateUser)
			}

			// Categories management routes
			categories := admin.Group("/categories")
			{
				categories.GET("", adminCategoriesHandler.ListCategories)
				categories.POST("", adminCategoriesHandler.CreateCategory)
				categories.PUT("/:id", adminCategoriesHandler.UpdateCategory)
				categories.DELETE("/:id", adminCategoriesHandler.DeleteCategory)
			}

			// Brands management routes
			brands := admin.Group("/brands")
			{
				brands.GET("", adminBrandsHandler.ListBrands)
				brands.POST("", adminBrandsHandler.CreateBrand)
				brands.PUT("/:id", adminBrandsHandler.UpdateBrand)
				brands.DELETE("/:id", adminBrandsHandler.DeleteBrand)
			}

			// Upload routes
			upload := admin.Group("/upload")
			{
				upload.POST("/image", uploadHandler.UploadImage)
				upload.POST("/images", uploadHandler.UploadMultipleImages)
				upload.DELETE("/images/:id", uploadHandler.DeleteImage)
			}
		}

		// Static file serving for uploads - serve from root uploads directory
		// This will serve files from ./uploads/product/, ./uploads/categories/, etc.
		s.router.StaticFS("/uploads", gin.Dir("./uploads", true))

		// Order routes (Protected)
		orders := api.Group("/orders")
		orders.Use(middleware.AuthMiddleware(s.config.JWT.AccessTokenSecret))
		{
			orders.GET("", orderHandler.List)
			orders.GET("/:id", orderHandler.GetByID)
			orders.POST("", orderHandler.Create)
			orders.PUT("/:id", orderHandler.Update)
			orders.DELETE("/:id", orderHandler.Delete)
		}

		// Cart routes (Protected)
		cart := api.Group("/cart")
		cart.Use(middleware.AuthMiddleware(s.config.JWT.AccessTokenSecret))
		{
			cart.GET("", cartHandler.GetCart)
			cart.POST("/items", cartHandler.AddToCart)
			cart.PUT("/items/:id", cartHandler.UpdateCartItem)
			cart.DELETE("/items/:id", cartHandler.RemoveFromCart)
			cart.DELETE("", cartHandler.ClearCart)
		}

		// Wishlist routes (Protected)
		wishlist := api.Group("/wishlist")
		wishlist.Use(middleware.AuthMiddleware(s.config.JWT.AccessTokenSecret))
		{
			wishlist.GET("", wishlistHandler.GetWishlist)
			wishlist.POST("", wishlistHandler.AddToWishlist)
			wishlist.DELETE("/:productId", wishlistHandler.RemoveFromWishlist)
		}

		// Health check
		api.GET("/health", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"status": "ok",
				"timestamp": time.Now().UTC(),
			})
		})
	}

	// Root route
	s.router.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "Electronics Store API",
			"version": "1.0.0",
		})
	})
}

func (s *Server) Start() error {
	// Auto migrate database
	if err := s.db.AutoMigrate(); err != nil {
		return fmt.Errorf("failed to migrate database: %w", err)
	}

	// Create HTTP server
	server := &http.Server{
		Addr:         fmt.Sprintf("%s:%s", s.config.Server.Host, s.config.Server.Port),
		Handler:      s.router,
		ReadTimeout:  s.config.Server.ReadTimeout,
		WriteTimeout: s.config.Server.WriteTimeout,
	}

	// Start server
	fmt.Printf("Starting server on %s:%s\n", s.config.Server.Host, s.config.Server.Port)
	return server.ListenAndServe()
}

func (s *Server) Shutdown(ctx context.Context) error {
	return s.db.Close()
}
