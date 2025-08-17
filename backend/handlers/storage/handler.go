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

func NewStorageHandler(resumeBucket *spaces.ResumeBucket, log *zap.Logger) *StorageHandler {
	if resumeBucket == nil || log == nil {
		panic("resumeBucket and log must be non-nil")
	}
	return &StorageHandler{ResumeBucket: resumeBucket, log: log}
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

	file, err := c.FormFile("file")

	if err != nil {
		h.log.Error("Failed to get file", zap.Error(err))
        c.JSON(http.StatusBadRequest, gin.H{"error": "file is required"})
        return
    }

	if file.Size > MAX_RESUME_FILE_SIZE {
		h.log.Error("File is too large", zap.Int64("size", file.Size))
		c.JSON(http.StatusBadRequest, gin.H{"error": "file is too large"})
		return
	}

	h.log.Debug("Uploading file", zap.String("file", file.Filename))
	
	err = h.ResumeBucket.UploadResumeAsset(c.Request.Context(), req.UserID, req.Version, req.ResumeName, file)

	if err != nil {
		h.log.Error("Failed to upload resume asset", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// TODO: Convert the PDF to a webp image of varying sizes.

	c.JSON(http.StatusOK, gin.H{"message": "Resume uploaded successfully"})
}

// TODO: Implement this
func (h *StorageHandler) DeleteResume(c *gin.Context) {
}

// TODO: Implement this
func (h *StorageHandler) GetResumes(c *gin.Context) {
	
}




