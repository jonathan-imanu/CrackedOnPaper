package storage

// A lone endpoint for uploading resumes.

import (
	"fmt"
	"main/service/auth"
	"main/service/image"
	"main/service/resume"
	"main/service/spaces"
	"mime"
	"net/http"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
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

func NewStorageHandler(resumeBucket *spaces.ResumeBucket, resumeService *resume.ResumeService, authService *auth.AuthService, imageService *image.ImageService, log *zap.Logger) *StorageHandler {
	if resumeBucket == nil || resumeService == nil || authService == nil || imageService == nil || log == nil {
		panic("resumeBucket, resumeService, authService, and log must be non-nil")
	}
	return &StorageHandler{ResumeBucket: resumeBucket, ResumeService: resumeService, authService: authService, ImageService: imageService, log: log}
}

func (h *StorageHandler) RegisterRoutes(rg *gin.RouterGroup) {
	g := rg.Group("/storage")
	g.POST("", h.authService.AuthMiddleware(), h.UploadResume)
	g.GET("/:resume_id/download", h.authService.AuthMiddleware(), h.DownloadResume)
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

	// Validate file
	h.log.Debug("Validating resume file", zap.String("file", file.Filename))

	pdfMetadata, err := h.ResumeBucket.ValidateResumeFile(file)
	pdfMetadata.StorageKey = pgtype.Text{String: h.ResumeBucket.Prefix(userIDString, req.ResumeName), Valid: true}

	if err != nil {
		h.log.Error("Invalid resume file", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{
			"error": err.Error(),
		})
		return
	}


	h.log.Debug("Uploading file", zap.String("file", file.Filename), zap.Int16("page_count", pdfMetadata.PageCount))
	
	err = h.ResumeBucket.UploadResumeAsset(c.Request.Context(), userIDString, req.ResumeName, file)

	if err != nil {
		h.log.Error("Failed to upload resume asset", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	
	imageMetadata := &image.ImageMetadata{ImageReady: false, ImageKeyPrefix: pgtype.Text{String: "", Valid: true}}
	resume, err := h.ResumeService.CreateResume(c.Request.Context(), userIDString, req.ResumeName, req.Industry, req.YoeBucket, pdfMetadata, imageMetadata)

	if err != nil {
		h.log.Error("Failed to create resume", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	webpResumeKey, err := h.ImageService.ConvertPDFToWebp(c.Request.Context(), userIDString, resume.ID.String(), file)
	if err != nil {
		h.log.Error("Failed to convert PDF to WebP",
			zap.String("user_id", userIDString),
			zap.String("resume_name", req.ResumeName),
			zap.Error(err))
	}

	h.log.Info("Successfully processed resume", 
		zap.String("user_id", userIDString),
		zap.String("resume_name", req.ResumeName),
		zap.String("webp_resume_id", webpResumeKey),
	)

	imageMetadata.ImageReady = err == nil
	imageMetadata.ImageKeyPrefix = pgtype.Text{String: webpResumeKey, Valid: true}

	err = h.ResumeService.UpdateImageMetadataForResume(c.Request.Context(), userIDString, resume.ID.String(), imageMetadata)

	if err != nil {
		h.log.Error("Failed to create resume", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Resume uploaded successfully", "resume": resume, })
}

func (h *StorageHandler) DownloadResume(c *gin.Context) {
	resumeID := c.Param("resume_id")
	if resumeID == "" {
		h.log.Error("Resume ID is required")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Resume ID is required"})
		return
	}
	
	userID, ok := h.authService.GetUserIDString(c)
	if !ok {
		h.log.Error("Failed to get user ID")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user ID"})
		return
	}

	resume, err := h.ResumeService.GetResume(c.Request.Context(), userID, resumeID)
	if err != nil {
		h.log.Error("Failed to get resume", zap.Error(err))
		c.JSON(http.StatusNotFound, gin.H{"error": "Resume not found"})
		return
	}

	storageKey := h.ResumeBucket.Prefix(userID, resume.Name)
	
	headResult, err := h.ResumeBucket.BucketClient.Client.HeadObject(c.Request.Context(), &s3.HeadObjectInput{
		Bucket: aws.String(h.ResumeBucket.BucketClient.Name),
		Key:    aws.String(storageKey),
	})

	if err != nil {
		h.log.Error("Failed to get file metadata", 
			zap.String("storageKey", storageKey),
			zap.Error(err))
		c.JSON(http.StatusNotFound, gin.H{"error": "File not found"})
		return
	}
	
	filename := resume.Name + ".pdf"
	c.Header("Content-Disposition", "attachment; filename=\""+filename+"\"")
	
	if headResult.ContentType != nil {
		c.Header("Content-Type", *headResult.ContentType)
	} else {
		c.Header("Content-Type", "application/pdf")
	}
	
	if headResult.ContentLength != nil {
		c.Header("Content-Length", fmt.Sprintf("%d", *headResult.ContentLength))
	}
	
	c.Header("Cache-Control", "no-cache, no-store, must-revalidate")
	c.Header("Pragma", "no-cache")
	c.Header("Expires", "0")
	
	bytesWritten, err := h.ResumeBucket.BucketClient.StreamFileToWriter(c.Request.Context(), h.ResumeBucket.BucketClient.Name, storageKey, c.Writer)
	if err != nil {
		h.log.Error("Failed to stream file", 
			zap.String("storageKey", storageKey),
			zap.Error(err))
		return
	}
	
	h.log.Info("Resume downloaded successfully",
		zap.String("resumeID", resumeID),
		zap.String("userID", userID),
		zap.Int64("bytesWritten", bytesWritten))
}

