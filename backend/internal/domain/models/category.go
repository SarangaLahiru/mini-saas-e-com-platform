package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Category struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	ResourceID  string    `gorm:"uniqueIndex;type:char(36);not null" json:"resource_id"`
	Name        string    `gorm:"size:100;not null" json:"name"`
	Slug        string    `gorm:"uniqueIndex;size:100;not null" json:"slug"`
	Description string    `gorm:"type:text" json:"description"`
	Image       string    `gorm:"size:500" json:"image"`
	ParentID    *uint     `gorm:"index" json:"parent_id"`
	SortOrder   int       `gorm:"default:0" json:"sort_order"`
	IsActive    bool      `gorm:"default:true" json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`

	// Relationships
	Parent   *Category  `gorm:"foreignKey:ParentID" json:"parent,omitempty"`
	Children []Category `gorm:"foreignKey:ParentID" json:"children,omitempty"`
	Products []Product  `gorm:"foreignKey:CategoryID" json:"products,omitempty"`
}

func (c *Category) BeforeCreate(tx *gorm.DB) error {
	if c.ResourceID == "" {
		c.ResourceID = uuid.New().String()
	}
	return nil
}
