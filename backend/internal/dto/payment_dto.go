package dto

import "errors"

type CreatePaymentRequest struct {
	OrderResourceID string  `json:"order_resource_id" binding:"required"`
	Method          string  `json:"method" binding:"required,oneof=credit_card debit_card paypal stripe bank_transfer"`
	Amount          float64 `json:"amount" binding:"required,min=0"`
	Currency        string  `json:"currency" binding:"required,len=3"`
	TransactionID   string  `json:"transaction_id" binding:"omitempty"`
	GatewayResponse string  `json:"gateway_response" binding:"omitempty"`
}

func (c *CreatePaymentRequest) Validate() error {
	if len(c.Currency) != 3 {
		return errors.New("currency must be 3 characters")
	}
	
	validMethods := []string{"credit_card", "debit_card", "paypal", "stripe", "bank_transfer"}
	isValid := false
	for _, method := range validMethods {
		if c.Method == method {
			isValid = true
			break
		}
	}
	if !isValid {
		return errors.New("invalid payment method")
	}
	
	return nil
}

// PaymentResponse is already defined in order_dto.go

