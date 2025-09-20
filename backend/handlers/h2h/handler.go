package h2h

import (
	"net/http"

	sqlc "main/db/sqlc"
	"main/service/auth"
	"main/service/h2h"
	"main/utils"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgtype"
	"go.uber.org/zap"
)

type H2HHandler struct {
	db 			*sqlc.Queries
	h2hService 	*h2h.H2HService
	log 		*zap.Logger
	authService *auth.AuthService
}

func NewH2HHandler(db *sqlc.Queries, h2hService *h2h.H2HService, log *zap.Logger, authService *auth.AuthService) *H2HHandler {
	if db == nil || h2hService == nil || log == nil || authService == nil {
		panic("db, h2hService, log, and authService must be non-nil")
	}
	return &H2HHandler{
		db:          db,
		h2hService:  h2hService,
		log:        log,
		authService: authService,
	}
}

func (h *H2HHandler) RegisterRoutes(rg *gin.RouterGroup) {
	g := rg.Group("/h2h")
	g.POST("/matches", h.CreateMatch)
	g.POST("/matches/:match_id/resolve", h.ResolveMatch)
	g.GET("/leaderboard", h.GetLeaderboard)
	g.POST("/matches/:match_id/skip", h.SkipMatch)
}

func (h *H2HHandler) CreateMatch(c *gin.Context) {
	var req CreateMatchRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.log.Error("Failed to bind request", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	result, err := h.h2hService.CreateMatch(c.Request.Context(), req.Industry, req.YoeBucket)
	if err != nil {
		h.log.Error("Failed to create match", zap.Error(err), zap.String("industry", req.Industry), zap.String("yoe_bucket", req.YoeBucket))

		if err.Error() == "no matches available for "+req.Industry+"/"+req.YoeBucket {
			c.JSON(http.StatusNotFound, gin.H{"error": "No matches available for the specified industry and experience level"})
			return
		}
		if err.Error() == "insufficient candidates for matching in "+req.Industry+"/"+req.YoeBucket {
			c.JSON(http.StatusConflict, gin.H{"error": "Insufficient candidates for matching"})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create match"})
		return
	}

	response := h.convertToMatchResponse(result)
	c.JSON(http.StatusOK, response)
}

func (h *H2HHandler) ResolveMatch(c *gin.Context) {
	matchID := c.Param("match_id")
	if matchID == "" {
		h.log.Error("Match ID is required")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Match ID is required"})
		return
	}

	matchUUID, err := utils.ConvertStringToUUID(matchID)
    if err != nil {
        h.log.Error("Failed to convert match ID to UUID", zap.Error(err))
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid match ID"})
        return
    }

    var req ResolveMatchRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        h.log.Error("Failed to bind request", zap.Error(err))
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    userID, ok := h.authService.GetUserID(c)
	if !ok {
		userID = pgtype.UUID{}
	}

	winnerPgUUID := pgtype.UUID{}
    if err := winnerPgUUID.Scan(req.WinnerResumeID.String()); err != nil {
        h.log.Error("Failed to convert winner resume ID", zap.Error(err))
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid winner resume ID"})
        return
    }

	resolvedMatch, err := h.h2hService.ResolveMatch(c.Request.Context(), matchUUID, winnerPgUUID, &userID)
    if err != nil {
        h.log.Error("Failed to resolve match", zap.Error(err), zap.String("match_id", matchID))
        
        if err.Error() == "match is already resolved or cancelled" {
            c.JSON(http.StatusConflict, gin.H{"error": "Match has already been resolved"})
            return
        }
        if err.Error() == "winner must be one of the match participants" {
            c.JSON(http.StatusBadRequest, gin.H{"error": "Winner must be one of the match participants"})
            return
        }
        
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to resolve match"})
        return
    }

    response := h.convertToResolveMatchResponse(resolvedMatch)
    c.JSON(http.StatusOK, response)
}

func (h *H2HHandler) GetLeaderboard(c *gin.Context) {
	var req LeaderboardRequest
    if err := c.ShouldBindQuery(&req); err != nil {
        h.log.Error("Failed to bind query parameters", zap.Error(err))
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    if req.Limit <= 0 {
        req.Limit = 50
    }
    if req.MinBattles < 0 {
        req.MinBattles = 0
    }

    resumes, err := h.h2hService.GetLeaderboard(
        c.Request.Context(),
        req.Industry,
        req.YoeBucket,
        int32(req.MinBattles),
        int32(req.Limit),
        int32(req.Offset),
    )
    if err != nil {
        h.log.Error("Failed to get leaderboard", zap.Error(err))
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get leaderboard"})
        return
    }

    response := h.convertToLeaderboardResponse(resumes, req)
    c.JSON(http.StatusOK, response)
}

func (h *H2HHandler) SkipMatch(c *gin.Context) {
	matchID := c.Param("match_id")
	if matchID == "" {
		h.log.Error("Match ID is required")
		c.JSON(http.StatusBadRequest, gin.H{"error": "Match ID is required"})
		return
	}

	matchUUID, err := utils.ConvertStringToUUID(matchID)
	if err != nil {
		h.log.Error("Failed to convert match ID to UUID", zap.Error(err))
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid match ID"})
		return
	}

	err = h.h2hService.SkipMatch(c.Request.Context(), matchUUID)
	if err != nil {
		h.log.Error("Failed to skip match", zap.Error(err))
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to skip match"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Match skipped successfully"})
}

// Helper functions
func (h *H2HHandler) convertToMatchResponse(result *sqlc.GetMatchWithResumesRow) MatchResponse {
	return MatchResponse{
		MatchID:      utils.ConvertPgUUIDToUUID(result.MatchID),
		Industry:     result.Industry,
		YoeBucket:    result.YoeBucket,
		CreatedAt:    result.MatchCreatedAt.Time,
		ResumeA: ResumeDetail{
			ID:			 utils.ConvertPgUUIDToUUID(result.ResumeAID),
			Name:		 result.ResumeAName,
			ImageKeyPrefix: utils.ConvertPgTextToString(result.ResumeAImagePrefix),
			CurrentElo: int(result.ResumeAElo),
			BattlesCount: int(result.ResumeABattles),
		},
		ResumeB: ResumeDetail{
			ID:			 utils.ConvertPgUUIDToUUID(result.ResumeBID),
			Name:		 result.ResumeBName,
			ImageKeyPrefix: utils.ConvertPgTextToString(result.ResumeBImagePrefix),
			CurrentElo: int(result.ResumeBElo),
			BattlesCount: int(result.ResumeBBattles),
		},
	}
}

func (h *H2HHandler) convertToResolveMatchResponse(match *sqlc.AppMatch) ResolveMatchResponse {
    return ResolveMatchResponse{
        MatchID:        utils.ConvertPgUUIDToUUID(match.ID),
        WinnerResumeID: utils.ConvertPgUUIDToUUID(match.WinnerResumeID),
        LoserResumeID:  utils.ConvertPgUUIDToUUID(match.LoserResumeID),
        DeltaA:         int(match.DeltaA.Int32),
        DeltaB:         int(match.DeltaB.Int32),
        KFactorUsed:    int(match.KFactorUsed.Int32),
        ResolvedAt:     match.ResolvedAt.Time,
    }
}

func (h *H2HHandler) convertToLeaderboardResponse(resumes []sqlc.GetLeaderboardRow, req LeaderboardRequest) LeaderboardResponse {
    leaderboardResumes := make([]LeaderboardResume, len(resumes))
    for i, resume := range resumes {
        leaderboardResumes[i] = LeaderboardResume{
            ID:           utils.ConvertPgUUIDToUUID(resume.ID),
            Name:         resume.Name,
            OwnerUserID:  utils.ConvertPgUUIDToUUID(resume.OwnerUserID),
            Industry:     resume.Industry,
            YoeBucket:    resume.YoeBucket,
            CurrentElo:   int(resume.CurrentEloInt),
            BattlesCount: int(resume.BattlesCount),
            Rank:         req.Offset + i + 1,
        }
    }

    return LeaderboardResponse{
        Resumes:   leaderboardResumes,
        Total:     len(leaderboardResumes),
        Industry:  req.Industry,
        YoeBucket: req.YoeBucket,
    }
}

