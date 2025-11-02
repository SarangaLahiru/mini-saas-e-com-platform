package handlers

import (
	"net/http"
	"time"

	"electronics-store/internal/dto"
	"electronics-store/internal/usecase"

	"github.com/gin-gonic/gin"
)

type AddressHandler struct {
	addressUsecase usecase.AddressUsecase
}

func NewAddressHandler(addressUsecase usecase.AddressUsecase) *AddressHandler {
	return &AddressHandler{
		addressUsecase: addressUsecase,
	}
}

// CreateAddress godoc
// @Summary Create a new address
// @Description Create a new address for the authenticated user
// @Tags auth
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body dto.AddressRequest true "Address request"
// @Success 200 {object} dto.AddressResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Router /auth/addresses [post]
func (h *AddressHandler) CreateAddress(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error:   "Unauthorized",
			Message: "User not authenticated",
		})
		return
	}

	var req dto.AddressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: err.Error(),
		})
		return
	}

	address, err := h.addressUsecase.CreateAddress(c.Request.Context(), userID.(uint), req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to create address",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.AddressResponse{
		ResourceID:   address.ResourceID,
		Type:         address.Type,
		FirstName:    address.FirstName,
		LastName:     address.LastName,
		Company:      address.Company,
		AddressLine1: address.AddressLine1,
		AddressLine2: address.AddressLine2,
		City:         address.City,
		State:        address.State,
		PostalCode:   address.PostalCode,
		Country:      address.Country,
		Phone:        address.Phone,
		IsDefault:    address.IsDefault,
		CreatedAt:    address.CreatedAt.Format(time.RFC3339),
		UpdatedAt:    address.UpdatedAt.Format(time.RFC3339),
	})
}

// GetUserAddresses godoc
// @Summary Get user addresses
// @Description Get all addresses for the authenticated user
// @Tags auth
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {array} dto.AddressResponse
// @Failure 401 {object} dto.ErrorResponse
// @Router /auth/addresses [get]
func (h *AddressHandler) GetUserAddresses(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error:   "Unauthorized",
			Message: "User not authenticated",
		})
		return
	}

	addresses, err := h.addressUsecase.GetUserAddresses(c.Request.Context(), userID.(uint))
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to get addresses",
			Message: err.Error(),
		})
		return
	}

	responses := make([]dto.AddressResponse, len(addresses))
	for i, addr := range addresses {
		responses[i] = dto.AddressResponse{
			ResourceID:   addr.ResourceID,
			Type:         addr.Type,
			FirstName:    addr.FirstName,
			LastName:     addr.LastName,
			Company:      addr.Company,
			AddressLine1: addr.AddressLine1,
			AddressLine2: addr.AddressLine2,
			City:         addr.City,
			State:        addr.State,
			PostalCode:   addr.PostalCode,
			Country:      addr.Country,
			Phone:        addr.Phone,
			IsDefault:    addr.IsDefault,
			CreatedAt:    addr.CreatedAt.Format(time.RFC3339),
			UpdatedAt:    addr.UpdatedAt.Format(time.RFC3339),
		}
	}

	c.JSON(http.StatusOK, responses)
}

// UpdateAddress godoc
// @Summary Update an address
// @Description Update an existing address
// @Tags auth
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Address Resource ID"
// @Param request body dto.UpdateAddressRequest true "Update address request"
// @Success 200 {object} dto.AddressResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Router /auth/addresses/{id} [put]
func (h *AddressHandler) UpdateAddress(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error:   "Unauthorized",
			Message: "User not authenticated",
		})
		return
	}

	resourceID := c.Param("id")
	
	// Get address by resource ID to find the ID
	address, err := h.addressUsecase.GetAddressByResourceID(c.Request.Context(), userID.(uint), resourceID)
	if err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{
			Error:   "Address not found",
			Message: err.Error(),
		})
		return
	}

	var req dto.UpdateAddressRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: err.Error(),
		})
		return
	}

	updatedAddress, err := h.addressUsecase.UpdateAddress(c.Request.Context(), userID.(uint), address.ID, req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to update address",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.AddressResponse{
		ResourceID:   updatedAddress.ResourceID,
		Type:         updatedAddress.Type,
		FirstName:    updatedAddress.FirstName,
		LastName:     updatedAddress.LastName,
		Company:      updatedAddress.Company,
		AddressLine1: updatedAddress.AddressLine1,
		AddressLine2: updatedAddress.AddressLine2,
		City:         updatedAddress.City,
		State:        updatedAddress.State,
		PostalCode:   updatedAddress.PostalCode,
		Country:      updatedAddress.Country,
		Phone:        updatedAddress.Phone,
		IsDefault:    updatedAddress.IsDefault,
		CreatedAt:    updatedAddress.CreatedAt.Format(time.RFC3339),
		UpdatedAt:    updatedAddress.UpdatedAt.Format(time.RFC3339),
	})
}

// DeleteAddress godoc
// @Summary Delete an address
// @Description Delete an address
// @Tags auth
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Address Resource ID"
// @Success 200 {object} dto.SuccessResponse
// @Failure 401 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Router /auth/addresses/{id} [delete]
func (h *AddressHandler) DeleteAddress(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error:   "Unauthorized",
			Message: "User not authenticated",
		})
		return
	}

	resourceID := c.Param("id")
	
	// Get address by resource ID to find the ID
	address, err := h.addressUsecase.GetAddressByResourceID(c.Request.Context(), userID.(uint), resourceID)
	if err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{
			Error:   "Address not found",
			Message: err.Error(),
		})
		return
	}

	err = h.addressUsecase.DeleteAddress(c.Request.Context(), userID.(uint), address.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to delete address",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Message: "Address deleted successfully",
	})
}

// SetDefaultAddress godoc
// @Summary Set default address
// @Description Set an address as the default address
// @Tags auth
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "Address Resource ID"
// @Success 200 {object} dto.SuccessResponse
// @Failure 401 {object} dto.ErrorResponse
// @Failure 404 {object} dto.ErrorResponse
// @Router /auth/addresses/{id}/default [post]
func (h *AddressHandler) SetDefaultAddress(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, dto.ErrorResponse{
			Error:   "Unauthorized",
			Message: "User not authenticated",
		})
		return
	}

	resourceID := c.Param("id")
	
	// Get address by resource ID to find the ID
	address, err := h.addressUsecase.GetAddressByResourceID(c.Request.Context(), userID.(uint), resourceID)
	if err != nil {
		c.JSON(http.StatusNotFound, dto.ErrorResponse{
			Error:   "Address not found",
			Message: err.Error(),
		})
		return
	}

	err = h.addressUsecase.SetDefaultAddress(c.Request.Context(), userID.(uint), address.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to set default address",
			Message: err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, dto.SuccessResponse{
		Message: "Default address updated successfully",
	})
}

