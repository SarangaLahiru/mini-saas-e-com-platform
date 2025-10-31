package database

import (
	"fmt"
	"log"
	"time"

	"electronics-store/internal/config"
	"electronics-store/internal/domain/models"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type Connection struct {
	DB *gorm.DB
}

func NewConnection(cfg config.DatabaseConfig) (*Connection, error) {
	// Build DSN - handle empty password correctly
	var dsn string
	if cfg.Password == "" {
		dsn = fmt.Sprintf("%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
			cfg.User,
			cfg.Host,
			cfg.Port,
			cfg.DBName,
		)
	} else {
		dsn = fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
			cfg.User,
			cfg.Password,
			cfg.Host,
			cfg.Port,
			cfg.DBName,
		)
	}

	// Debug: Print connection details
	log.Printf("Database config - Host: %s, Port: %s, User: %s, Password: '%s', DBName: %s", 
		cfg.Host, cfg.Port, cfg.User, cfg.Password, cfg.DBName)
	
	// Debug: Print DSN (without password for security)
	debugDSN := dsn
	if cfg.Password != "" {
		debugDSN = fmt.Sprintf("%s:***@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
			cfg.User, cfg.Host, cfg.Port, cfg.DBName)
	}
	log.Printf("Connecting to database: %s", debugDSN)

	// Configure GORM
	gormConfig := &gorm.Config{
		Logger: logger.Default.LogMode(logger.Info),
		NowFunc: func() time.Time {
			return time.Now().UTC()
		},
	}

	// Connect to database
	db, err := gorm.Open(mysql.Open(dsn), gormConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	// Configure connection pool
	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get underlying sql.DB: %w", err)
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	// Test connection
	if err := sqlDB.Ping(); err != nil {
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	log.Println("Database connected successfully")

	return &Connection{DB: db}, nil
}

func (c *Connection) AutoMigrate() error {
	// Check if tables already exist (from schema.sql)
	var count int64
	c.DB.Raw("SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = ? AND table_name = 'users'", c.DB.Migrator().CurrentDatabase()).Scan(&count)
	
	if count > 0 {
		log.Println("Database schema already exists, skipping GORM migration")
		return nil
	}

	// Disable foreign key checks during migration
	c.DB.Exec("SET FOREIGN_KEY_CHECKS=0;")
	defer c.DB.Exec("SET FOREIGN_KEY_CHECKS=1;")

	// Auto migrate all models in correct order
	err := c.DB.AutoMigrate(
		&models.User{},
		&models.OTPVerification{},
		&models.Address{},
		&models.Category{},
		&models.Product{},
		&models.Image{},
		&models.Variant{},
		&models.Review{},
		&models.Order{},
		&models.OrderItem{},
		&models.Payment{},
		&models.Cart{},
		&models.CartItem{},
		&models.Wishlist{},
		&models.Discount{},
		&models.Promotion{},
	)

	if err != nil {
		return fmt.Errorf("failed to auto migrate: %w", err)
	}

	log.Println("Database migration completed successfully")
	return nil
}

func (c *Connection) Close() error {
	sqlDB, err := c.DB.DB()
	if err != nil {
		return err
	}
	return sqlDB.Close()
}
