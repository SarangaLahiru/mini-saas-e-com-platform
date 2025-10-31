package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type User struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	ResourceID  string    `gorm:"uniqueIndex;type:char(36);not null" json:"resource_id"`
	Username    string    `gorm:"uniqueIndex;size:50;not null" json:"username"`
	Email       string    `gorm:"uniqueIndex;size:100;not null" json:"email"`
	Password    string    `gorm:"size:255" json:"-"`
	Phone       string    `gorm:"size:20" json:"phone"`
	FirstName   string    `gorm:"size:50" json:"first_name"`
	LastName    string    `gorm:"size:50" json:"last_name"`
	Avatar      string    `gorm:"size:500" json:"avatar"`
	IsActive    bool      `gorm:"default:true" json:"is_active"`
	IsAdmin     bool      `gorm:"default:false" json:"is_admin"`
	IsVerified  bool      `gorm:"default:false" json:"is_verified"`
	GoogleID    string    `gorm:"column:google_id;uniqueIndex;size:100" json:"-"`
	LastLoginAt *time.Time `json:"last_login_at"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	// Relationships
	Addresses []Address `gorm:"foreignKey:UserID" json:"addresses,omitempty"`
	Orders    []Order   `gorm:"foreignKey:UserID" json:"orders,omitempty"`
	Reviews   []Review  `gorm:"foreignKey:UserID" json:"reviews,omitempty"`
}

type Address struct {
	ID         uint   `gorm:"primaryKey" json:"id"`
	ResourceID string `gorm:"uniqueIndex;type:char(36);not null" json:"resource_id"`
	UserID     uint   `gorm:"not null" json:"user_id"`
	Type       string `gorm:"size:20;not null" json:"type"` // home, work, other
	Street     string `gorm:"size:200;not null" json:"street"`
	City       string `gorm:"size:50;not null" json:"city"`
	State      string `gorm:"size:50;not null" json:"state"`
	Country    string `gorm:"size:50;not null" json:"country"`
	PostalCode string `gorm:"size:20;not null" json:"postal_code"`
	IsDefault  bool   `gorm:"default:false" json:"is_default"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`

	// Relationships
	User User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

type OTPVerification struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	ResourceID string    `gorm:"uniqueIndex;type:char(36);not null" json:"resource_id"`
	UserID     *uint     `gorm:"index" json:"user_id"`
	Email      string    `gorm:"size:100;not null;index" json:"email"`
	Phone      string    `gorm:"size:20;index" json:"phone"`
	OTPCode    string    `gorm:"size:10;not null;index" json:"otp_code"`
	OTPType    string    `gorm:"type:enum('email_verification','phone_verification','password_reset','login');not null" json:"otp_type"`
	IsUsed     bool      `gorm:"default:false" json:"is_used"`
	ExpiresAt  time.Time `gorm:"not null;index" json:"expires_at"`
	CreatedAt  time.Time `json:"created_at"`
	UpdatedAt  time.Time `json:"updated_at"`

	// Relationships
	User *User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

func (u *User) BeforeCreate(tx *gorm.DB) error {
	if u.ResourceID == "" {
		u.ResourceID = uuid.New().String()
	}
	return nil
}

func (a *Address) BeforeCreate(tx *gorm.DB) error {
	if a.ResourceID == "" {
		a.ResourceID = uuid.New().String()
	}
	return nil
}

func (o *OTPVerification) BeforeCreate(tx *gorm.DB) error {
	if o.ResourceID == "" {
		o.ResourceID = uuid.New().String()
	}
	return nil
}
