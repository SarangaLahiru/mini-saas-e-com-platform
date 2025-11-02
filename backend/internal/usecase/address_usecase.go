package usecase

import (
	"context"
	"errors"

	"electronics-store/internal/dto"
	"electronics-store/internal/domain/models"
	"electronics-store/internal/repository"

	"github.com/google/uuid"
)

var (
	ErrAddressNotFound = errors.New("address not found")
	ErrUnauthorized    = errors.New("unauthorized to access this address")
)

type AddressUsecase interface {
	CreateAddress(ctx context.Context, userID uint, req dto.AddressRequest) (*models.Address, error)
	GetUserAddresses(ctx context.Context, userID uint) ([]*models.Address, error)
	GetAddress(ctx context.Context, userID uint, addressID uint) (*models.Address, error)
	GetAddressByResourceID(ctx context.Context, userID uint, resourceID string) (*models.Address, error)
	UpdateAddress(ctx context.Context, userID uint, addressID uint, req dto.UpdateAddressRequest) (*models.Address, error)
	DeleteAddress(ctx context.Context, userID uint, addressID uint) error
	SetDefaultAddress(ctx context.Context, userID uint, addressID uint) error
}

type addressUsecase struct {
	addressRepo repository.AddressRepository
}

func NewAddressUsecase(addressRepo repository.AddressRepository) AddressUsecase {
	return &addressUsecase{
		addressRepo: addressRepo,
	}
}

func (u *addressUsecase) CreateAddress(ctx context.Context, userID uint, req dto.AddressRequest) (*models.Address, error) {
	// If this is set as default, unset other defaults
	if req.IsDefault {
		u.addressRepo.SetDefault(ctx, userID, 0) // 0 means just unset all
	}

	address := &models.Address{
		ResourceID:   uuid.New().String(),
		UserID:       userID,
		Type:         req.Type,
		FirstName:    req.FirstName,
		LastName:     req.LastName,
		Company:      req.Company,
		AddressLine1: req.AddressLine1,
		AddressLine2: req.AddressLine2,
		City:         req.City,
		State:        req.State,
		Country:      req.Country,
		PostalCode:   req.PostalCode,
		Phone:        req.Phone,
		IsDefault:    req.IsDefault,
	}

	err := u.addressRepo.Create(ctx, address)
	if err != nil {
		return nil, err
	}

	// If set as default, update it
	if req.IsDefault {
		err = u.SetDefaultAddress(ctx, userID, address.ID)
		if err != nil {
			return nil, err
		}
		address.IsDefault = true
	}

	return address, nil
}

func (u *addressUsecase) GetUserAddresses(ctx context.Context, userID uint) ([]*models.Address, error) {
	return u.addressRepo.GetByUserID(ctx, userID)
}

func (u *addressUsecase) GetAddress(ctx context.Context, userID uint, addressID uint) (*models.Address, error) {
	address, err := u.addressRepo.GetByID(ctx, addressID)
	if err != nil {
		return nil, err
	}
	if address == nil {
		return nil, ErrAddressNotFound
	}

	// Verify ownership
	if address.UserID != userID {
		return nil, ErrUnauthorized
	}

	return address, nil
}

func (u *addressUsecase) GetAddressByResourceID(ctx context.Context, userID uint, resourceID string) (*models.Address, error) {
	address, err := u.addressRepo.GetByResourceID(ctx, resourceID)
	if err != nil {
		return nil, err
	}
	if address == nil {
		return nil, ErrAddressNotFound
	}

	// Verify ownership
	if address.UserID != userID {
		return nil, ErrUnauthorized
	}

	return address, nil
}

func (u *addressUsecase) UpdateAddress(ctx context.Context, userID uint, addressID uint, req dto.UpdateAddressRequest) (*models.Address, error) {
	address, err := u.GetAddress(ctx, userID, addressID)
	if err != nil {
		return nil, err
	}

	// Update fields
	if req.Type != nil {
		address.Type = *req.Type
	}
	if req.FirstName != nil {
		address.FirstName = *req.FirstName
	}
	if req.LastName != nil {
		address.LastName = *req.LastName
	}
	if req.Company != nil {
		address.Company = *req.Company
	}
	if req.AddressLine1 != nil {
		address.AddressLine1 = *req.AddressLine1
	}
	if req.AddressLine2 != nil {
		address.AddressLine2 = *req.AddressLine2
	}
	if req.City != nil {
		address.City = *req.City
	}
	if req.State != nil {
		address.State = *req.State
	}
	if req.PostalCode != nil {
		address.PostalCode = *req.PostalCode
	}
	if req.Country != nil {
		address.Country = *req.Country
	}
	if req.Phone != nil {
		address.Phone = *req.Phone
	}
	if req.IsDefault != nil && *req.IsDefault {
		// If setting as default, unset others first
		u.addressRepo.SetDefault(ctx, userID, addressID)
		address.IsDefault = true
	} else if req.IsDefault != nil && !*req.IsDefault {
		address.IsDefault = false
	}

	err = u.addressRepo.Update(ctx, address)
	if err != nil {
		return nil, err
	}

	return address, nil
}

func (u *addressUsecase) DeleteAddress(ctx context.Context, userID uint, addressID uint) error {
	// Verify ownership
	_, err := u.GetAddress(ctx, userID, addressID)
	if err != nil {
		return err
	}

	return u.addressRepo.Delete(ctx, addressID)
}

func (u *addressUsecase) SetDefaultAddress(ctx context.Context, userID uint, addressID uint) error {
	// Verify ownership
	_, err := u.GetAddress(ctx, userID, addressID)
	if err != nil {
		return err
	}

	return u.addressRepo.SetDefault(ctx, userID, addressID)
}

