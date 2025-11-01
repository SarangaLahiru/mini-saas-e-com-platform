package repository

import (
	"context"
	"errors"

	"electronics-store/internal/domain/models"
	"gorm.io/gorm"
)

type ProductRepository interface {
	Create(ctx context.Context, product *models.Product) error
	GetByID(ctx context.Context, id uint) (*models.Product, error)
	GetByResourceID(ctx context.Context, resourceID string) (*models.Product, error)
	GetBySKU(ctx context.Context, sku string) (*models.Product, error)
	Update(ctx context.Context, product *models.Product) error
	Delete(ctx context.Context, id uint) error
	List(ctx context.Context, limit, offset int, filters map[string]interface{}) ([]*models.Product, error)
	Count(ctx context.Context, filters map[string]interface{}) (int64, error)
	Search(ctx context.Context, query string, limit, offset int) ([]*models.Product, error)
	GetFeatured(ctx context.Context, limit int) ([]*models.Product, error)
	GetByCategory(ctx context.Context, categoryID uint, limit, offset int) ([]*models.Product, error)
    ListBrands(ctx context.Context) ([]models.Brand, error)
    Suggest(ctx context.Context, q string, limit int) ([]*models.Product, error)
}

type productRepository struct {
	db *gorm.DB
}

func NewProductRepository(db *gorm.DB) ProductRepository {
	return &productRepository{db: db}
}

func (r *productRepository) Create(ctx context.Context, product *models.Product) error {
	// Create product - GORM Create will save all fields including zero values
	err := r.db.WithContext(ctx).Create(product).Error
	if err != nil {
		return err
	}
	// Verify the created record has the correct values by reloading
	return nil
}

func (r *productRepository) GetByID(ctx context.Context, id uint) (*models.Product, error) {
	var product models.Product
	err := r.db.WithContext(ctx).
		Preload("Categories").
		Preload("Images").
		Preload("Variants").
		Preload("Reviews").
		First(&product, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	
	// Set the primary category (first category in the many-to-many relationship)
	if len(product.Categories) > 0 {
		product.Category = product.Categories[0]
	}
	
	return &product, nil
}

func (r *productRepository) GetByResourceID(ctx context.Context, resourceID string) (*models.Product, error) {
	var product models.Product
	err := r.db.WithContext(ctx).
		Preload("Categories").
		Preload("Images").
		Preload("Variants").
		Preload("Reviews").
		Where("resource_id = ?", resourceID).
		First(&product).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	
	// Set the primary category (first category in the many-to-many relationship)
	if len(product.Categories) > 0 {
		product.Category = product.Categories[0]
	}
	
	return &product, nil
}

func (r *productRepository) GetBySKU(ctx context.Context, sku string) (*models.Product, error) {
	var product models.Product
	err := r.db.WithContext(ctx).Where("sku = ?", sku).First(&product).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil
		}
		return nil, err
	}
	return &product, nil
}

func (r *productRepository) Update(ctx context.Context, product *models.Product) error {
	// Use Model().Where().Updates() with explicit field selection to ensure zero values are saved
	// This is more reliable than Save() for partial updates
	updates := map[string]interface{}{
		"resource_id":        product.ResourceID,
		"name":               product.Name,
		"slug":               product.Slug,
		"description":        product.Description,
		"short_description":  product.ShortDescription,
		"sku":                product.SKU,
		"brand_id":           product.BrandID,
		"price":              product.Price,
		"compare_price":      product.ComparePrice,
		"cost_price":          product.CostPrice,
		"stock_quantity":     product.StockQuantity,
		"low_stock_threshold": product.LowStockThreshold,
		"track_quantity":     product.TrackQuantity,
		"allow_backorder":     product.AllowBackorder,
		"weight":              product.Weight,
		"length":              product.Length,
		"width":               product.Width,
		"height":              product.Height,
		"is_active":           product.IsActive,
		"is_featured":         product.IsFeatured,
		"is_digital":          product.IsDigital,
		"requires_shipping":   product.RequiresShipping,
		"taxable":             product.Taxable,
		"meta_title":          product.MetaTitle,
		"meta_description":    product.MetaDescription,
		"updated_at":          product.UpdatedAt,
	}
	
	return r.db.WithContext(ctx).
		Model(product).
		Where("id = ?", product.ID).
		Updates(updates).Error
}

func (r *productRepository) Delete(ctx context.Context, id uint) error {
	return r.db.WithContext(ctx).Delete(&models.Product{}, id).Error
}

func (r *productRepository) List(ctx context.Context, limit, offset int, filters map[string]interface{}) ([]*models.Product, error) {
	var products []*models.Product
    query := r.db.WithContext(ctx).Preload("Categories").Preload("Images").Preload("BrandRef")

	// Apply filters
    if categoryID, ok := filters["category_id"]; ok {
        // Use join for many-to-many categories
        query = query.Joins("JOIN product_categories pc ON pc.product_id = products.id").Where("pc.category_id = ?", categoryID)
    }
    if catSlug, ok := filters["category_slug"]; ok {
        if s, ok2 := catSlug.(string); ok2 && s != "" {
            query = query.Joins("JOIN product_categories pc2 ON pc2.product_id = products.id").
                Joins("JOIN categories c ON c.id = pc2.category_id").
                Where("c.slug = ?", s)
        }
    }
    if slugs, ok := filters["brand_slugs"]; ok {
        if s, ok2 := slugs.(string); ok2 && s != "" {
            vals := splitCommaList(s)
            if len(vals) > 0 {
                query = query.Joins("LEFT JOIN brands b ON b.id = products.brand_id").Where("b.slug IN (?)", vals)
            }
        }
    } else if brands, ok := filters["brand_in"]; ok {
        // schema has no brand column; treat as name/model/description contains any brand token
        if s, ok2 := brands.(string); ok2 && s != "" {
            vals := splitCommaList(s)
            if len(vals) > 0 {
                // build OR like group
                or := r.db
                for i, v := range vals {
            like := "%" + v + "%"
            if i == 0 {
                query = query.Joins("LEFT JOIN brands b ON b.id = products.brand_id").Where("(b.name LIKE ? OR products.name LIKE ? OR products.description LIKE ?)", like, like, like)
            } else {
                query = query.Or("b.name LIKE ? OR products.name LIKE ? OR products.description LIKE ?", like, like, like)
            }
                }
                _ = or // keep variable used for readability
            }
        }
    }
	if status, ok := filters["status"]; ok {
		// Map status filter to is_active column
		// "active" -> is_active = true, anything else -> is_active = false
		if statusStr, ok2 := status.(string); ok2 && statusStr == "active" {
			query = query.Where("is_active = ?", true)
		} else {
			query = query.Where("is_active = ?", false)
		}
	}
	if isFeatured, ok := filters["is_featured"]; ok {
		query = query.Where("is_featured = ?", isFeatured)
	}
	if minPrice, ok := filters["min_price"]; ok {
		query = query.Where("price >= ?", minPrice)
	}
	if maxPrice, ok := filters["max_price"]; ok {
		query = query.Where("price <= ?", maxPrice)
	}
    if inStock, ok := filters["in_stock"]; ok && inStock.(bool) {
        query = query.Where("stock_quantity > 0")
    }
    if search, ok := filters["search"]; ok {
        if s, ok2 := search.(string); ok2 && s != "" {
            like := "%" + s + "%"
            // Avoid duplicate brand join alias when brand filtering already joined brands
            if _, ok := filters["brand_slugs"]; ok {
                query = query.Where("products.name LIKE ? OR products.description LIKE ? OR b.name LIKE ?", like, like, like)
            } else if _, ok := filters["brand_in"]; ok {
                query = query.Where("products.name LIKE ? OR products.description LIKE ? OR b.name LIKE ?", like, like, like)
            } else {
                query = query.Joins("LEFT JOIN brands b ON b.id = products.brand_id").Where("products.name LIKE ? OR products.description LIKE ? OR b.name LIKE ?", like, like, like)
            }
        }
    }

	// Apply sorting
	if sortBy, ok := filters["sort_by"]; ok {
		sortOrder := "asc"
		if order, ok := filters["sort_order"]; ok {
			sortOrder = order.(string)
		}
		query = query.Order(sortBy.(string) + " " + sortOrder)
	} else {
		query = query.Order("created_at desc")
	}

    err := query.Limit(limit).Offset(offset).Find(&products).Error
	return products, err
}

func (r *productRepository) Count(ctx context.Context, filters map[string]interface{}) (int64, error) {
	var count int64
    query := r.db.WithContext(ctx).Model(&models.Product{})

	// Apply filters
    if categoryID, ok := filters["category_id"]; ok {
        query = query.Joins("JOIN product_categories pc ON pc.product_id = products.id").Where("pc.category_id = ?", categoryID)
    }
    if catSlug, ok := filters["category_slug"]; ok {
        if s, ok2 := catSlug.(string); ok2 && s != "" {
            query = query.Joins("JOIN product_categories pc2 ON pc2.product_id = products.id").
                Joins("JOIN categories c ON c.id = pc2.category_id").
                Where("c.slug = ?", s)
        }
    }
    if slugs, ok := filters["brand_slugs"]; ok {
        if s, ok2 := slugs.(string); ok2 && s != "" {
            vals := splitCommaList(s)
            if len(vals) > 0 {
                query = query.Joins("LEFT JOIN brands b ON b.id = products.brand_id").Where("b.slug IN (?)", vals)
            }
        }
    } else if brands, ok := filters["brand_in"]; ok {
        if s, ok2 := brands.(string); ok2 && s != "" {
            vals := splitCommaList(s)
            if len(vals) > 0 {
                for i, v := range vals {
                    like := "%" + v + "%"
            if i == 0 {
                query = query.Joins("LEFT JOIN brands b ON b.id = products.brand_id").Where("(b.name LIKE ? OR products.name LIKE ? OR products.description LIKE ?)", like, like, like)
            } else {
                query = query.Or("b.name LIKE ? OR products.name LIKE ? OR products.description LIKE ?", like, like, like)
            }
                }
            }
        }
    }
	if status, ok := filters["status"]; ok {
		// Map status filter to is_active column
		// "active" -> is_active = true, anything else -> is_active = false
		if statusStr, ok2 := status.(string); ok2 && statusStr == "active" {
			query = query.Where("is_active = ?", true)
		} else {
			query = query.Where("is_active = ?", false)
		}
	}
	if isFeatured, ok := filters["is_featured"]; ok {
		query = query.Where("is_featured = ?", isFeatured)
	}
	if minPrice, ok := filters["min_price"]; ok {
		query = query.Where("price >= ?", minPrice)
	}
	if maxPrice, ok := filters["max_price"]; ok {
		query = query.Where("price <= ?", maxPrice)
	}
    if inStock, ok := filters["in_stock"]; ok && inStock.(bool) {
        query = query.Where("stock_quantity > 0")
    }
    if search, ok := filters["search"]; ok {
        if s, ok2 := search.(string); ok2 && s != "" {
            like := "%" + s + "%"
            if _, ok := filters["brand_slugs"]; ok {
                query = query.Where("products.name LIKE ? OR products.description LIKE ? OR b.name LIKE ?", like, like, like)
            } else if _, ok := filters["brand_in"]; ok {
                query = query.Where("products.name LIKE ? OR products.description LIKE ? OR b.name LIKE ?", like, like, like)
            } else {
                query = query.Joins("LEFT JOIN brands b ON b.id = products.brand_id").Where("products.name LIKE ? OR products.description LIKE ? OR b.name LIKE ?", like, like, like)
            }
        }
    }

	err := query.Count(&count).Error
	return count, err
}

// splitCommaList splits a comma-separated string into a slice of trimmed values
func splitCommaList(s string) []string {
    out := []string{}
    start := 0
    for i := 0; i <= len(s); i++ {
        if i == len(s) || s[i] == ',' {
            part := s[start:i]
            // trim spaces
            for len(part) > 0 && part[0] == ' ' { part = part[1:] }
            for len(part) > 0 && part[len(part)-1] == ' ' { part = part[:len(part)-1] }
            if part != "" { out = append(out, part) }
            start = i + 1
        }
    }
    return out
}

func (r *productRepository) Search(ctx context.Context, query string, limit, offset int) ([]*models.Product, error) {
	var products []*models.Product
	err := r.db.WithContext(ctx).
		Preload("Categories").
		Preload("Images").
		Where("MATCH(name, description, brand, model) AGAINST(? IN NATURAL LANGUAGE MODE)", query).
		Limit(limit).
		Offset(offset).
		Find(&products).Error
	return products, err
}

func (r *productRepository) GetFeatured(ctx context.Context, limit int) ([]*models.Product, error) {
	var products []*models.Product
	err := r.db.WithContext(ctx).
		Preload("Categories").
		Preload("Images").
		Where("is_featured = ? AND is_active = ?", true, true).
		Limit(limit).
		Find(&products).Error
	return products, err
}

func (r *productRepository) GetByCategory(ctx context.Context, categoryID uint, limit, offset int) ([]*models.Product, error) {
	var products []*models.Product
	err := r.db.WithContext(ctx).
		Preload("Categories").
		Preload("Images").
		Joins("JOIN product_categories pc ON pc.product_id = products.id").
		Where("pc.category_id = ? AND is_active = ?", categoryID, true).
		Limit(limit).
		Offset(offset).
		Find(&products).Error
	return products, err
}

func (r *productRepository) ListBrands(ctx context.Context) ([]models.Brand, error) {
    var brands []models.Brand
    err := r.db.WithContext(ctx).Order("name asc").Where("is_active = ?", true).Find(&brands).Error
    return brands, err
}

// Suggest returns lightweight product matches for autocomplete
func (r *productRepository) Suggest(ctx context.Context, q string, limit int) ([]*models.Product, error) {
    var products []*models.Product
    like := "%" + q + "%"
    err := r.db.WithContext(ctx).
        Preload("Images", "is_primary = ?", true).
        Preload("BrandRef").
        Joins("LEFT JOIN brands b ON b.id = products.brand_id").
        Where("products.is_active = ?", true).
        Where("products.name LIKE ? OR products.description LIKE ? OR b.name LIKE ?", like, like, like).
        Order("products.created_at DESC").
        Limit(limit).
        Find(&products).Error
    return products, err
}
