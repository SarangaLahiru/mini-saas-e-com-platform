package dto

// Public search response for products, categories, and brands
type SearchResponse struct {
	Query   string         `json:"query"`
	Results SearchResults  `json:"results"`
	Totals  SearchTotals   `json:"totals"`
}

type SearchResults struct {
	Products   []ProductSearchResult   `json:"products"`
	Categories []CategorySearchResult   `json:"categories"`
	Brands     []BrandSearchResult      `json:"brands"`
}

type SearchTotals struct {
	Products   int64 `json:"products"`
	Categories int64 `json:"categories"`
	Brands     int64 `json:"brands"`
}

type ProductSearchResult struct {
	ResourceID string  `json:"resource_id"`
	Name        string  `json:"name"`
	Slug        string  `json:"slug"`
	Price       float64 `json:"price"`
	Image       string  `json:"image"`
	Brand       string  `json:"brand"`
}

type CategorySearchResult struct {
	ResourceID string `json:"resource_id"`
	Name       string `json:"name"`
	Slug       string `json:"slug"`
	Image      string `json:"image"`
}

type BrandSearchResult struct {
	ResourceID string `json:"resource_id"`
	Name       string `json:"name"`
	Slug       string `json:"slug"`
}

