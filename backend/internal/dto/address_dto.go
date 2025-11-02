package dto

type AddressRequest struct {
	Type        string `json:"type" binding:"required,oneof=billing shipping"`
	FirstName   string `json:"first_name" binding:"required,min=2,max=50"`
	LastName    string `json:"last_name" binding:"required,min=2,max=50"`
	Company     string `json:"company" binding:"omitempty,max=100"`
	AddressLine1 string `json:"address_line_1" binding:"required,min=5,max=255"`
	AddressLine2 string `json:"address_line_2" binding:"omitempty,max=255"`
	City        string `json:"city" binding:"required,min=2,max=100"`
	State       string `json:"state" binding:"required,min=2,max=100"`
	PostalCode  string `json:"postal_code" binding:"required,min=3,max=20"`
	Country     string `json:"country" binding:"required,min=2,max=100"`
	Phone       string `json:"phone" binding:"omitempty,min=10,max=20"`
	IsDefault   bool   `json:"is_default"`
}

type UpdateAddressRequest struct {
	Type        *string `json:"type" binding:"omitempty,oneof=billing shipping"`
	FirstName   *string `json:"first_name" binding:"omitempty,min=2,max=50"`
	LastName    *string `json:"last_name" binding:"omitempty,min=2,max=50"`
	Company     *string `json:"company" binding:"omitempty,max=100"`
	AddressLine1 *string `json:"address_line_1" binding:"omitempty,min=5,max=255"`
	AddressLine2 *string `json:"address_line_2" binding:"omitempty,max=255"`
	City        *string `json:"city" binding:"omitempty,min=2,max=100"`
	State       *string `json:"state" binding:"omitempty,min=2,max=100"`
	PostalCode  *string `json:"postal_code" binding:"omitempty,min=3,max=20"`
	Country     *string `json:"country" binding:"omitempty,min=2,max=100"`
	Phone       *string `json:"phone" binding:"omitempty,min=10,max=20"`
	IsDefault   *bool   `json:"is_default"`
}

type AddressResponse struct {
	ResourceID   string `json:"resource_id"`
	Type         string `json:"type"`
	FirstName    string `json:"first_name"`
	LastName     string `json:"last_name"`
	Company      string `json:"company,omitempty"`
	AddressLine1 string `json:"address_line_1"`
	AddressLine2 string `json:"address_line_2,omitempty"`
	City         string `json:"city"`
	State        string `json:"state"`
	PostalCode   string `json:"postal_code"`
	Country      string `json:"country"`
	Phone        string `json:"phone,omitempty"`
	IsDefault    bool   `json:"is_default"`
	CreatedAt    string `json:"created_at"`
	UpdatedAt    string `json:"updated_at"`
}

