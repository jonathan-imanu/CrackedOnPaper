package resume_handler

import (
	db "main/db/sqlc"
	sqlc "main/db/sqlc"
	"main/service/auth"
	"main/utils"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"
)

type ResumeHandler struct {
	db *sqlc.Queries
	log *zap.Logger
	authService *auth.AuthService
}

func NewResumeHandler(db *sqlc.Queries, log *zap.Logger, authService *auth.AuthService) *ResumeHandler {
	if db == nil || log == nil || authService == nil {
		panic("db, log, and authService must be non-nil")
	}
	return &ResumeHandler{db: db, log: log, authService: authService}
}

func (h *ResumeHandler) RegisterRoutes(rg *gin.RouterGroup) {
	g := rg.Group("/resume")
	g.PUT("", h.authService.AuthMiddleware(), h.RenameResume)
	g.GET("", h.authService.AuthMiddleware(), h.GetResumes)
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
	
	c.JSON(http.StatusOK, resumes)
}