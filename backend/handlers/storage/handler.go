package storage

// CRUD endpoints for uploading resumes and webps.

import (
	"main/service/image"
	"main/service/spaces"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

const MAX_RESUME_FILE_SIZE = 1024 * 1024 // 1MB

type StorageHandler struct {
	ResumeBucket *spaces.ResumeBucket
	ImageService *image.ImageService
	log *zap.Logger
}

func NewStorageHandler(resumeBucket *spaces.ResumeBucket, imageService *image.ImageService, log *zap.Logger) *StorageHandler {
	if resumeBucket == nil || imageService == nil || log == nil {
		panic("resumeBucket, imageService, and log must be non-nil")
	}
	return &StorageHandler{
		ResumeBucket: resumeBucket, 
		ImageService: imageService, 
		log: log,
	}
}

func (h *StorageHandler) RegisterRoutes(rg *gin.RouterGroup) {
	g := rg.Group("/storage")
	g.POST("", h.UploadResume)
	g.DELETE("", h.DeleteResume)
	g.GET("", h.GetResumes)
}

func (h *StorageHandler) UploadResume(c *gin.Context) {
	// Validate the request
	var req UploadResumeRequest

    if err := c.ShouldBind(&req); err != nil {
		h.log.Error("Failed to bind request", zap.Error(err))
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

	file := req.File

	// Validate file size
	if file.Size > MAX_RESUME_FILE_SIZE {
		h.log.Error("File is too large", zap.Int64("size", file.Size))
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "file is too large",
			"max_size_mb": MAX_RESUME_FILE_SIZE / (1024 * 1024),
			"actual_size_mb": float64(file.Size) / (1024 * 1024),
		})
		return
	}

	// Validate file type
	if file.Header.Get("Content-Type") != "application/pdf" {
		h.log.Error("Invalid file type", zap.String("content_type", file.Header.Get("Content-Type")))
		c.JSON(http.StatusBadRequest, gin.H{"error": "only PDF files are supported"})
		return
	}

	h.log.Info("Processing resume upload", 
		zap.String("user_id", req.UserID),
		zap.String("resume_name", req.ResumeName),
		zap.String("filename", file.Filename),
		zap.Int64("size", file.Size),
	)

	// Upload PDF to resume bucket
	err := h.ResumeBucket.UploadResumeAsset(c.Request.Context(), req.UserID, req.ResumeName, file)
	if err != nil {
		h.log.Error("Failed to upload resume asset", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// TODO: Convert the PDF to a webp image of varying sizes.
	webpResumeID, err := h.ImageService.ConvertPDFToWebp(c.Request.Context(), file)
	if err != nil {
		h.log.Error("Failed to convert PDF to WebP",
			zap.String("user_id", req.UserID),
			zap.String("resume_name", req.ResumeName),
			zap.Error(err))
		// Don't return error - PDF upload succeeded, WebP is optimization
		c.JSON(http.StatusOK, gin.H{
			"message": "Resume uploaded successfully, but preview generation failed",
			"pdf_uploaded": true,
			"webp_generated": false,
			"user_id": req.UserID,
			"resume_name": req.ResumeName,
		})
		return
	}

	h.log.Info("Successfully processed resume", 
		zap.String("user_id", req.UserID),
		zap.String("resume_name", req.ResumeName),
		zap.String("webp_resume_id", webpResumeID),
)
	// Return success response
	c.JSON(http.StatusOK, gin.H{
		"message": "Resume uploaded and preview generated successfully",
		"pdf_uploaded": true,
		"webp_generated": true,
		"user_id": req.UserID,
		"resume_name": req.ResumeName,
		"webp_resume_id": webpResumeID, // For future database storage
	})
}

// TODO: Implement this
func (h *StorageHandler) DeleteResume(c *gin.Context) {
}

// TODO: Implement this
func (h *StorageHandler) GetResumes(c *gin.Context) {
	
}




