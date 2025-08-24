package resume_handler

import (
	db "main/db/sqlc"
	sqlc "main/db/sqlc"
	"main/service/auth"
	"main/service/spaces"
	"main/utils"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

// Endpoints for the resume actions.

type ResumeHandler struct {
	db *sqlc.Queries
	webpBucket *spaces.WebpBucket
	resumeBucket *spaces.ResumeBucket
	log *zap.Logger
	authService *auth.AuthService
}

func NewResumeHandler(db *sqlc.Queries, webpBucket *spaces.WebpBucket, resumeBucket *spaces.ResumeBucket, log *zap.Logger, authService *auth.AuthService) *ResumeHandler {
	if db == nil || webpBucket == nil || resumeBucket == nil || log == nil || authService == nil {
		panic("db, webpBucket, resumeBucket, log, and authService must be non-nil")
	}
	return &ResumeHandler{db: db, webpBucket: webpBucket, resumeBucket: resumeBucket, log: log, authService: authService}
}

func (h *ResumeHandler) RegisterRoutes(rg *gin.RouterGroup) {
	g := rg.Group("/resume")
	g.PUT("", h.authService.AuthMiddleware(), h.RenameResume)
	g.GET("", h.authService.AuthMiddleware(), h.GetResumes)
	g.DELETE("/:resume_id", h.authService.AuthMiddleware(), h.DeleteResume)
}

func (h *ResumeHandler) RenameResume(c *gin.Context) {
	var req RenameResumeRequest

	if err := c.ShouldBind(&req); err != nil {
		h.log.Error("Failed to bind request", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, ok := h.authService.GetUserID(c)
	if !ok {
		h.log.Error("Failed to get user ID")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user ID"})
		return
	}

	resumeID, err := utils.ConvertStringToUUID(req.ResumeID)
	if err != nil {
		h.log.Error("Failed to convert resume ID to UUID", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid resume ID"})
		return
	}

	resume, err := h.db.UpdateResumeName(c.Request.Context(), db.UpdateResumeNameParams{
		ID: resumeID,
		OwnerUserID: userID,
		Name: req.NewName,
	})

	if err != nil {
		h.log.Error("Failed to update resume name", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update resume name"})
		return
	}


	c.JSON(http.StatusOK, resume)
}

func (h *ResumeHandler) GetResumes(c *gin.Context) {
	userID, ok := h.authService.GetUserID(c)
	if !ok {
		h.log.Error("Failed to get user ID")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user ID"})
		return
	}
	
	resumes, err := h.db.ListResumesByOwner(c.Request.Context(), db.ListResumesByOwnerParams{
		OwnerUserID: userID,
		Limit: 3, // User can only have up to 3 resumes so this doesn't really matter
		Offset: 0,
	})
	
	if err != nil {
		h.log.Error("Failed to get resumes", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get resumes"})
		return
	}
	
	if resumes == nil {
		c.JSON(http.StatusOK, []db.AppResume{})
		return
	}
	
	c.JSON(http.StatusOK, resumes)
}

func (h *ResumeHandler) DeleteResume(c *gin.Context) {
	resumeId := c.Param("resume_id")
	if resumeId == "" {
		h.log.Error("Resume ID is required")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Resume ID is required"})
		return
	}

	resumeID, err := utils.ConvertStringToUUID(resumeId)
	if err != nil {
		h.log.Error("Failed to convert resume ID to UUID", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid resume ID"})
		return
	}

	var req DeleteResumeRequest
	if err := c.ShouldBind(&req); err != nil {
		h.log.Error("Failed to bind request", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	userID, ok := h.authService.GetUserID(c)
	if !ok {
		h.log.Error("Failed to get user ID")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get user ID"})
		return
	}
	
	err = h.db.DeleteResumeByIDForOwner(c.Request.Context(), db.DeleteResumeByIDForOwnerParams{
		ID: resumeID,
		OwnerUserID: userID,
	})

	if err != nil {
		h.log.Error("Failed to delete resume", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete resume"})
		return
	}

	err = h.resumeBucket.DeleteResume(c.Request.Context(), req.PdfStorageKey)
	if err != nil {
		h.log.Error("Failed to delete resume from resume bucket", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete resume from resume bucket"})
		return
	}

	err = h.webpBucket.DeleteWebp(c.Request.Context(), req.ImageKeyPrefix)
	if err != nil {
		h.log.Error("Failed to delete resume from webp bucket", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete resume from webp bucket"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Resume deleted successfully"})
}
