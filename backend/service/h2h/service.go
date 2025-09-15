package h2h

import (
	"context"
	"fmt"
	"math"

	sqlc "main/db/sqlc"
	"main/utils"

	"go.uber.org/zap"

	"github.com/jackc/pgx/v5/pgtype"
)

type H2HService struct {
	db *sqlc.Queries
	log *zap.Logger
}

func NewH2HService(db *sqlc.Queries, log *zap.Logger) *H2HService {
	return &H2HService{db: db, log: log}
}

func (s *H2HService) CreateMatch(ctx context.Context, industry, yoeBucket string) (*sqlc.GetMatchWithResumesRow, error) {
	pair, err := s.db.FindMatchPair(ctx, sqlc.FindMatchPairParams{
		Industry:  industry,
		YoeBucket: yoeBucket,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to find match pair: %w", err)
	}

	seedID, seedIDValid := utils.ConvertToUUID(pair.SeedID)
	seedElo, _ := utils.ConvertToInt32(pair.SeedElo)
	downID, downIDValid := utils.ConvertToUUID(pair.DownID)
	downElo, _ := utils.ConvertToInt32(pair.DownElo)
	upID, upIDValid := utils.ConvertToUUID(pair.UpID)
	upElo, _ := utils.ConvertToInt32(pair.UpElo)

	if !seedIDValid {
		return nil, fmt.Errorf("no matches available for %s/%s", industry, yoeBucket)
	}

	if !downIDValid && !upIDValid {
		return nil, fmt.Errorf("insufficient candidates for matching in %s/%s", industry, yoeBucket)
	}

	// Choose the closer opponent (down vs up)
	var opponentID pgtype.UUID
	if downIDValid && upIDValid {
		// Both available - choose closer ELo
		downDiff := abs(seedElo - downElo)
		upDiff := abs(seedElo - upElo)

		if downDiff <= upDiff {
			opponentID = downID
		} else {
			opponentID = upID
		}
	} else if downIDValid {
		opponentID = downID
	} else {
		opponentID = upID
	}

	// Mark both resumes as in-flight
	err = s.db.SetResumesInFlight(ctx, sqlc.SetResumesInFlightParams{
		Column1:  []pgtype.UUID{seedID, opponentID},
		InFlight: true,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to set resumes in-flight: %w", err)
	}

	match, err := s.db.CreateMatch(ctx, sqlc.CreateMatchParams{
		ResumeAID: seedID,
		ResumeBID: opponentID,
		Industry:  industry,
		YoeBucket: yoeBucket,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create match: %w", err)
	}

	result, err := s.db.GetMatchWithResumes(ctx, match.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get match with resumes: %w", err)
	}
	return &result, nil
}

func (s *H2HService) ResolveMatch(ctx context.Context, matchID pgtype.UUID, winnerID pgtype.UUID, decidedByUserID *pgtype.UUID) (*sqlc.AppMatch, error) {
	matchDetails, err := s.db.GetMatchWithResumes(ctx, matchID)
	if err != nil {
		return nil, fmt.Errorf("failed to get match details: %w", err)
	}

	if matchDetails.State != "created" {
		return nil, fmt.Errorf("match is already resolved or cancelled")
	}

	var loserID pgtype.UUID
	if winnerID.Bytes == matchDetails.ResumeAID.Bytes {
		loserID = matchDetails.ResumeBID
	} else if winnerID.Bytes == matchDetails.ResumeBID.Bytes {
		loserID = matchDetails.ResumeAID
	} else {
		return nil, fmt.Errorf("winner must be one of the match participants")
	}

	resumeIDs := []pgtype.UUID{matchDetails.ResumeAID, matchDetails.ResumeBID}
	resumes, err := s.db.GetResumesForEloUpdate(ctx, resumeIDs)
	if err != nil {
		return nil, fmt.Errorf("failed to get resumes for elo update: %w", err)
	}

	if len(resumes) != 2 {
		return nil, fmt.Errorf("expected 2 resumes, got %d", len(resumes))
	}

	var resumeA, resumeB sqlc.GetResumesForEloUpdateRow
	for _, resume := range resumes {
		if resume.ID.Bytes == matchDetails.ResumeAID.Bytes {
			resumeA = resume
		} else {
			resumeB = resume
		}
	}

	// Calculate Elo changes
	kFactor := calculateKFactor(resumeA.BattlesCount, resumeB.BattlesCount)
	deltaA, deltaB := calculateEloDeltas(
		int(resumeA.CurrentEloInt),
		int(resumeB.CurrentEloInt),
		winnerID.Bytes == resumeA.ID.Bytes,
		kFactor,
	)

	// Calculate new Elo ratings
	newEloA := resumeA.CurrentEloInt + int32(deltaA)
	newEloB := resumeB.CurrentEloInt + int32(deltaB)

	// Update both resumes' ELO ratings
	err = s.db.UpdateResumeEloStats(ctx, sqlc.UpdateResumeEloStatsParams{
		ID:            matchDetails.ResumeAID,
		CurrentEloInt: newEloA,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to update resume A: %w", err)
	}

	err = s.db.UpdateResumeEloStats(ctx, sqlc.UpdateResumeEloStatsParams{
		ID:            matchDetails.ResumeBID,
		CurrentEloInt: newEloB,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to update resume B: %w", err)
	}

	err = s.db.IncrementBattlesForMatch(ctx, []pgtype.UUID{matchDetails.ResumeAID, matchDetails.ResumeBID})
	if err != nil {
		return nil, fmt.Errorf("failed to increment battles count: %w", err)
	}

	deltaAPgtype := pgtype.Int4{Int32: int32(deltaA), Valid: true}
	deltaBPgtype := pgtype.Int4{Int32: int32(deltaB), Valid: true}
	kFactorPgtype := pgtype.Int4{Int32: int32(kFactor), Valid: true}

	var decidedBy pgtype.UUID
	if decidedByUserID != nil {
		decidedBy = *decidedByUserID
	}

	resolvedMatch, err := s.db.ResolveMatch(ctx, sqlc.ResolveMatchParams{
		ID:              matchID,
		WinnerResumeID:  winnerID,
		LoserResumeID:   loserID,
		DecidedByUserID: decidedBy,
		DeltaA:          deltaAPgtype,
		DeltaB:          deltaBPgtype,
		KFactorUsed:     kFactorPgtype,
	})

	if err != nil {
		return nil, fmt.Errorf("failed to resolve match: %w", err)
	}

	return &resolvedMatch, nil
}

func (s *H2HService) GetLeaderboard(ctx context.Context, industry *string, yoeBucket *string, battlesCount, limit, offset int32) ([]sqlc.GetLeaderboardRow, error) {
	if limit <= 0 || limit > 100 {
		limit = 50
	}
	if battlesCount < 0 {
		battlesCount = 0
	}

	var industryStr, yoeBucketStr string
	if industry != nil {
		industryStr = *industry
	}
	if yoeBucket != nil {
		yoeBucketStr = *yoeBucket
	}

	resumes, err := s.db.GetLeaderboard(ctx, sqlc.GetLeaderboardParams{
		Column1:     industryStr,
		Column2:    yoeBucketStr,
		BattlesCount: battlesCount,
		Limit:        limit,
		Offset:       offset,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get leaderboard: %w", err)
	}

	return resumes, nil
}

func (s *H2HService) SkipMatch(ctx context.Context, matchID pgtype.UUID) error {
	matchDetails, err := s.db.GetMatchWithResumes(ctx, matchID)
	if err != nil {
		return fmt.Errorf("failed to get match details: %w", err)
	}

	err = s.db.ResetInFlightStatus(ctx, []pgtype.UUID{matchDetails.ResumeAID, matchDetails.ResumeBID})
	if err != nil {
		return fmt.Errorf("failed to reset in-flight status: %w", err)
	}

	err = s.db.SkipMatch(ctx, matchID)
	if err != nil {
		return fmt.Errorf("failed to skip match: %w", err)
	}

	return nil
}

// Helper functions
func abs(a int32) int32 {
	if a < 0 {
		return -a
	}
	return a
}

func calculateKFactor(battlesA, battlesB int32) int {
	// K-factor policy
	maxBattles := battlesA
	if battlesB > maxBattles {
		maxBattles = battlesB
	}

	if maxBattles < 10 {
		return 40 // High K for new players
	} else if maxBattles < 50 {
		return 32 // Standard K
	} else {
		return 24 // Low K for experienced players
	}
}

func calculateEloDeltas(ratingA, ratingB int, aWins bool, kFactor int) (int, int) {
	// Standard Elo calculation
	expectedA := 1.0 / (1.0 + math.Pow(10.0, float64(ratingB-ratingA)/400.0))

	var scoreA float64
	if aWins {
		scoreA = 1.0
	} else {
		scoreA = 0.0
	}

	deltaA := int(float64(kFactor) * (scoreA - expectedA))
	deltaB := -deltaA

	return deltaA, deltaB
}

