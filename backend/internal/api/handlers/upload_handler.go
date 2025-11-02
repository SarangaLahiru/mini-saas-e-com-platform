package handlers

import (
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"electronics-store/internal/dto"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type UploadHandler struct {
	uploadDir string
	baseURL   string
}

func NewUploadHandler(uploadDir, baseURL string) *UploadHandler {
	// Ensure upload directory exists
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		fmt.Printf("Warning: Failed to create upload directory: %v\n", err)
	}
	
	// Create subdirectories for different upload types
	// Use consistent naming - keep as singular to match default type
	os.MkdirAll(filepath.Join(uploadDir, "product"), 0755)
	os.MkdirAll(filepath.Join(uploadDir, "categories"), 0755)
	os.MkdirAll(filepath.Join(uploadDir, "users"), 0755)

	return &UploadHandler{
		uploadDir: uploadDir,
		baseURL:   baseURL,
	}
}

// UploadImage godoc
// @Summary Upload a single image
// @Description Upload an image file (Admin only)
// @Tags admin
// @Accept multipart/form-data
// @Produce json
// @Param file formData file true "Image file"
// @Param type formData string false "Upload type (product, category, user)" default(product)
// @Success 200 {object} dto.UploadResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /admin/upload/image [post]
func (h *UploadHandler) UploadImage(c *gin.Context) {
	// Get file from form
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: "No file provided",
		})
		return
	}

	// Get upload type
	uploadType := c.PostForm("type")
	if uploadType == "" {
		uploadType = "product"
	}

	// Validate file type
	allowedExtensions := []string{".jpg", ".jpeg", ".png", ".gif", ".webp"}
	ext := strings.ToLower(filepath.Ext(file.Filename))
	allowed := false
	for _, allowedExt := range allowedExtensions {
		if ext == allowedExt {
			allowed = true
			break
		}
	}

	if !allowed {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid file type",
			Message: "Only image files (jpg, jpeg, png, gif, webp) are allowed",
		})
		return
	}

	// Validate file size (max 5MB)
	if file.Size > 5*1024*1024 {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "File too large",
			Message: "Maximum file size is 5MB",
		})
		return
	}

	// Generate unique filename
	resourceID := uuid.New().String()
	filename := fmt.Sprintf("%s%s", resourceID, ext)
	
	// Determine upload directory
	uploadPath := filepath.Join(h.uploadDir, uploadType, filename)

	// Save file
	if err := c.SaveUploadedFile(file, uploadPath); err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to save file",
			Message: err.Error(),
		})
		return
	}

	// Generate URL for static file serving
	// Use relative path that matches the static route in server.go
	url := fmt.Sprintf("/uploads/%s/%s", uploadType, filename)

	c.JSON(http.StatusOK, dto.UploadResponse{
		ResourceID: resourceID,
		URL:        url,
		Path:       uploadPath,
		Size:       file.Size,
		Type:       file.Header.Get("Content-Type"),
		CreatedAt:  time.Now(),
	})
}

// UploadMultipleImages godoc
// @Summary Upload multiple images
// @Description Upload multiple image files (Admin only)
// @Tags admin
// @Accept multipart/form-data
// @Produce json
// @Param files formData file true "Image files" allowMultiple=true
// @Param type formData string false "Upload type (product, category, user)" default(product)
// @Success 200 {object} dto.MultipleUploadResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /admin/upload/images [post]
func (h *UploadHandler) UploadMultipleImages(c *gin.Context) {
	// Get upload type
	uploadType := c.PostForm("type")
	if uploadType == "" {
		uploadType = "product"
	}

	// Get form
	form, err := c.MultipartForm()
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: "Failed to parse multipart form",
		})
		return
	}

	files := form.File["files"]
	if len(files) == 0 {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: "No files provided",
		})
		return
	}

	// Limit to 5 files
	if len(files) > 5 {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Too many files",
			Message: "Maximum 5 files allowed",
		})
		return
	}

	var uploads []dto.UploadResponse

	for _, file := range files {
		// Validate file type
		allowedExtensions := []string{".jpg", ".jpeg", ".png", ".gif", ".webp"}
		ext := strings.ToLower(filepath.Ext(file.Filename))
		allowed := false
		for _, allowedExt := range allowedExtensions {
			if ext == allowedExt {
				allowed = true
				break
			}
		}

		if !allowed {
			continue // Skip invalid files
		}

		// Validate file size (max 5MB)
		if file.Size > 5*1024*1024 {
			continue // Skip large files
		}

		// Generate unique filename
		resourceID := uuid.New().String()
		filename := fmt.Sprintf("%s%s", resourceID, ext)
		uploadPath := filepath.Join(h.uploadDir, uploadType, filename)

		// Open file
		src, err := file.Open()
		if err != nil {
			continue
		}
		defer src.Close()

		// Create destination file
		dst, err := os.Create(uploadPath)
		if err != nil {
			continue
		}
		defer dst.Close()

		// Copy file
		if _, err := io.Copy(dst, src); err != nil {
			continue
		}

		// Generate URL for static file serving
		url := fmt.Sprintf("/uploads/%s/%s", uploadType, filename)

		uploads = append(uploads, dto.UploadResponse{
			ResourceID: resourceID,
			URL:        url,
			Path:       uploadPath,
			Size:       file.Size,
			Type:       file.Header.Get("Content-Type"),
			CreatedAt:  time.Now(),
		})
	}

	if len(uploads) == 0 {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "No valid files",
			Message: "No valid image files were uploaded",
		})
		return
	}

	c.JSON(http.StatusOK, dto.MultipleUploadResponse{
		Images: uploads,
		Count:  len(uploads),
	})
}

// DeleteImage godoc
// @Summary Delete an uploaded image
// @Description Delete an image file (Admin only)
// @Tags admin
// @Accept json
// @Produce json
// @Param id path string true "Image Resource ID or filename"
// @Success 200 {object} dto.SuccessResponse
// @Failure 404 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /admin/upload/images/{id} [delete]
func (h *UploadHandler) DeleteImage(c *gin.Context) {
	id := c.Param("id")
	
	// Search for file in all upload directories
	uploadTypes := []string{"products", "categories", "users"}
	
	for _, uploadType := range uploadTypes {
		uploadPath := filepath.Join(h.uploadDir, uploadType)
		
		// Walk directory to find file
		err := filepath.Walk(uploadPath, func(path string, info os.FileInfo, err error) error {
			if err != nil {
				return nil
			}
			
			// Check if filename starts with the resource ID
			if strings.HasPrefix(filepath.Base(path), id) {
				if err := os.Remove(path); err != nil {
					return err
				}
				return filepath.SkipAll
			}
			
			return nil
		})
		
		if err == nil {
			c.JSON(http.StatusOK, dto.SuccessResponse{
				Message: "Image deleted successfully",
			})
			return
		}
	}

	c.JSON(http.StatusNotFound, dto.ErrorResponse{
		Error:   "Image not found",
		Message: "The specified image could not be found",
	})
}

// UploadProfileAvatar godoc
// @Summary Upload profile avatar
// @Description Upload a profile avatar image for authenticated user
// @Tags auth
// @Accept multipart/form-data
// @Produce json
// @Security BearerAuth
// @Param file formData file true "Avatar image file"
// @Success 200 {object} dto.UploadResponse
// @Failure 400 {object} dto.ErrorResponse
// @Failure 401 {object} dto.ErrorResponse
// @Failure 500 {object} dto.ErrorResponse
// @Router /auth/profile/avatar [post]
func (h *UploadHandler) UploadProfileAvatar(c *gin.Context) {
	// Get file from form
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid request",
			Message: "No file provided",
		})
		return
	}

	// Validate file type
	allowedExtensions := []string{".jpg", ".jpeg", ".png", ".gif", ".webp"}
	ext := strings.ToLower(filepath.Ext(file.Filename))
	allowed := false
	for _, allowedExt := range allowedExtensions {
		if ext == allowedExt {
			allowed = true
			break
		}
	}

	if !allowed {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "Invalid file type",
			Message: "Only image files (jpg, jpeg, png, gif, webp) are allowed",
		})
		return
	}

	// Validate file size (max 2MB for avatars)
	if file.Size > 2*1024*1024 {
		c.JSON(http.StatusBadRequest, dto.ErrorResponse{
			Error:   "File too large",
			Message: "Maximum file size is 2MB",
		})
		return
	}

	// Generate unique filename
	resourceID := uuid.New().String()
	filename := fmt.Sprintf("%s%s", resourceID, ext)
	
	// Always use "users" directory for profile avatars
	uploadType := "users"
	uploadPath := filepath.Join(h.uploadDir, uploadType, filename)

	// Save file
	if err := c.SaveUploadedFile(file, uploadPath); err != nil {
		c.JSON(http.StatusInternalServerError, dto.ErrorResponse{
			Error:   "Failed to save file",
			Message: err.Error(),
		})
		return
	}

	// Generate URL for static file serving
	url := fmt.Sprintf("/uploads/%s/%s", uploadType, filename)

	c.JSON(http.StatusOK, dto.UploadResponse{
		ResourceID: resourceID,
		URL:        url,
		Path:       uploadPath,
		Size:       file.Size,
		Type:       file.Header.Get("Content-Type"),
		CreatedAt:  time.Now(),
	})
}

