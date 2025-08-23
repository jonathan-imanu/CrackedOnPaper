package storage

// CRUD endpoints for uploading resumes and webps.

import (
	"main/service/auth"
	"main/service/image"
	"main/service/resume"
	"main/service/spaces"
	"mime"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgtype"
	"go.uber.org/zap"
)

type StorageHandler struct {
	ResumeBucket *spaces.ResumeBucket
	ResumeService *resume.ResumeService
	ImageService *image.ImageService
	authService *auth.AuthService
	log *zap.Logger
}

func NewStorageHandler(resumeBucket *spaces.ResumeBucket, resumeService *resume.ResumeService, authService *auth.AuthService, log *zap.Logger) *StorageHandler {
	if resumeBucket == nil || resumeService == nil || authService == nil || log == nil {
		panic("resumeBucket, resumeService, authService, and log must be non-nil")
	}
	return &StorageHandler{ResumeBucket: resumeBucket, ResumeService: resumeService, authService: authService, log: log}
}

func (h *StorageHandler) RegisterRoutes(rg *gin.RouterGroup) {
	g := rg.Group("/storage")
	g.POST("", h.UploadResume)
	g.DELETE("", h.authService.AuthMiddleware(), h.DeleteResume)
}

func (h *StorageHandler) UploadResume(c *gin.Context) {
	var req UploadResumeRequest

	if ct := c.GetHeader("Content-Type"); ct != "" {
		mediaType, _, err := mime.ParseMediaType(ct)
		if err != nil || mediaType != "multipart/form-data" {
			h.log.Error("invalid Content-Type", zap.String("content_type", ct))
			c.JSON(http.StatusBadRequest, gin.H{"error": "Content-Type must be multipart/form-data"})
			return
		}
	}

    if err := c.ShouldBind(&req); err != nil {
		h.log.Error("Failed to bind request", zap.Error(err))
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

	userID, ok1 := h.authService.GetUserID(c)
	userIDString, ok2 := h.authService.GetUserIDString(c)
	if !ok1 || !ok2 {
		h.log.Error("Failed to get user ID")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user ID"})
		return
	}

	// Verify that the user has a free slot to upload a resume.
	_, err := h.ResumeService.FindFreeSlotForOwner(c.Request.Context(), userID)
	if err != nil {
		h.log.Error("Failed to find free slot", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	file := req.File

	h.log.Debug("Validating resume file", zap.String("file", file.Filename))

	pdfMetadata, err := h.ResumeBucket.ValidateResumeFile(file)
	pdfMetadata.StorageKey = pgtype.Text{String: h.ResumeBucket.Prefix(userIDString, req.ResumeName), Valid: true}

	if err != nil {
		h.log.Error("Invalid resume file", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	h.log.Debug("Uploading file", zap.String("file", file.Filename), zap.Int16("page_count", pdfMetadata.PageCount))
	
	err = h.ResumeBucket.UploadResumeAsset(c.Request.Context(), userIDString, req.ResumeName, file)

	if err != nil {
		h.log.Error("Failed to upload resume asset", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	// TODO: Convert the PDF to a webp image of varying sizes

	imageMetadata := &image.ImageMetadata{ImageReady: false, ImageKeyPrefix: pgtype.Text{String: "", Valid: true}}

	resume, err := h.ResumeService.CreateResume(c.Request.Context(), userIDString, req.ResumeName, req.Industry, req.YoeBucket, pdfMetadata, imageMetadata)

	if err != nil {
		h.log.Error("Failed to create resume", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Resume uploaded successfully", "resume": resume})
}

func (h *StorageHandler) DeleteResume(c *gin.Context) {
	var req DeleteResumeRequest

	if err := c.ShouldBind(&req); err != nil {
		h.log.Error("Failed to bind request", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, ok := h.authService.GetUserIDString(c)
	if !ok {
		h.log.Error("Failed to get user ID")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user ID"})
		return
	}

	resume, err := h.ResumeService.GetResume(c.Request.Context(), userID, req.ResumeID)
	if err != nil {
		h.log.Error("Failed to get resume ID", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	err = h.ResumeBucket.DeleteResume(c.Request.Context(), userID, resume.Name)
	if err != nil {
		h.log.Error("Failed to delete resume", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	err = h.ResumeService.DeleteResume(c.Request.Context(), userID, req.ResumeID)
	if err != nil {
		h.log.Error("Failed to delete resume", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}


	c.JSON(http.StatusOK, gin.H{"message": "Resume deleted successfully"})
}



