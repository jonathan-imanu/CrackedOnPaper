package h2h

import (
	"time"
	"github.com/google/uuid"
)

type CreateMatchRequest struct {
	Industry  string `json:"industry" binding:"required,oneof=tech finance healthcare"`
	YoeBucket string `json:"yoe_bucket" binding:"required,oneof=entry mid senior"`
}

type ResolveMatchRequest struct {
	WinnerResumeID uuid.UUID `json:"winner_resume_id" binding:"required"`
}

type LeaderboardRequest struct {
	Industry  *string `form:"industry" binding:"omitempty,oneof=tech finance healthcare"`
	YoeBucket *string `form:"yoe_bucket" binding:"omitempty,oneof=entry mid senior"`
	MinBattles int    `form:"min_battles"`
	Limit      int    `form:"limit" binding:"min=1,max=100"`
	Offset     int    `form:"offset" binding:"min=0"`
}

type MatchResponse struct {
	MatchID    uuid.UUID     `json:"match_id"`
	ResumeA    ResumeDetail  `json:"resume_a"`
	ResumeB    ResumeDetail  `json:"resume_b"`
	Industry   string        `json:"industry"`
	YoeBucket  string        `json:"yoe_bucket"`
	CreatedAt  time.Time     `json:"created_at"`
}

type ResumeDetail struct {
	ID             uuid.UUID  `json:"id"`
	Name           string     `json:"name"`
	ImageKeyPrefix string     `json:"image_key_prefix"`
	CurrentElo     int        `json:"current_elo"`
	BattlesCount   int        `json:"battles_count"`
}

type ResolveMatchResponse struct {
	MatchID        uuid.UUID  `json:"match_id"`
	WinnerResumeID uuid.UUID  `json:"winner_resume_id"`
	LoserResumeID  uuid.UUID  `json:"loser_resume_id"`
	DeltaA         int        `json:"delta_a"`
	DeltaB         int        `json:"delta_b"`
	KFactorUsed    int        `json:"k_factor_used"`
	ResolvedAt     time.Time  `json:"resolved_at"`
}

type LeaderboardResponse struct {
	Resumes   []LeaderboardResume `json:"resumes"`
	Total     int                 `json:"total"`
	Industry  *string             `json:"industry"`
	YoeBucket *string             `json:"yoe_bucket"`
}

type LeaderboardResume struct {
	ID             uuid.UUID  `json:"id"`
	Name           string     `json:"name"`
	OwnerUserID    uuid.UUID  `json:"owner_user_id"`
	Industry       string    `json:"industry"`
	YoeBucket      string    `json:"yoe_bucket"`
	CurrentElo     int       `json:"current_elo"`
	BattlesCount   int       `json:"battles_count"`
	Rank           int       `json:"rank"`
}