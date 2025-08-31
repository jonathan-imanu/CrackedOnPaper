package h2h

import (
	"context"
	"fmt"
	"math"
	
	sqlc "main/db/sqlc"

	"github.com/jackc/pgx/v5/pgtype"
)

type H2HService struct {
	db *sqlc.Queries
}

func NewH2HService(db *sqlc.Queries) *H2HService {
	return &H2HService{db: db}
}

func (s *H2HService) CreateMatch(ctx context.Context, industry, yoeBucket string) (*sqlc.GetMatchWithResumesRow, error) {
	pair, err := s.db.FindMatchPair(ctx, sqlc.FindMatchPairParams{
		Industry:  industry,
		YoeBucket: yoeBucket,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to find match pair: %w", err)
	}
	
	if !pair.SeedID.Valid {
		return nil, fmt.Errorf("no matches available for %s/%s", industry, yoeBucket)
	}

	if !pair.DownID.Valid && !pair.UpID.Valid {
		return nil, fmt.Errorf("insufficient candidates for matching in %s/%s", industry, yoeBucket)
	}

	// Choose the closer opponent (down vs up)
	var opponentID pgtype.UUID
	if pair.DownID.Valid && pair.UpID.Valid {
		// Both available - choose closer ELo
		downDiff := abs(pair.SeedElo - pair.DownElo)
		upDiff := abs(pair.SeedElo - pair.UpElo)

		if downDiff <= upDiff {
			opponentID = pair.DownID
		} else {
			opponentID = pair.UpID
		}
	} else if pair.DownID.Valid {
		opponentID = pair.DownID
	} else {
		opponentID = pair.UpID
	}

	// Mark both resumes as in-flight
	err = s.db.SetResumesInFlight(ctx, sqlc.SetResumesInFlightParams{
		Column1:   []pgtype.UUID{pair.SeedID, opponentID},
		InFlight:  true,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to set resumes in-flight: %w", err)
	}

	// Create the match
	match, err := s.db.CreateMatch(ctx, sqlc.CreateMatchParams{
		ResumeAID: pair.SeedID,
		ResumeBID: opponentID,
		Industry:  industry,
		YoeBucket: yoeBucket,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to create match: %w", err)
	}

	// Return match details with resume info (sqlc type)
	result, err := s.db.GetMatchWithResumes(ctx, match.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get match with resumes: %w", err)
	}
	return &result, nil
}

func (s *H2HService) ResolveMatch(ctx context.Context, matchID pgtype.UUID, winnerID pgtype.UUID, decidedByUserID *pgtype.UUID) (*sqlc.AppMatch, error) {
	// Get match details
	matchDetails, err := s.db.GetMatchWithResumes(ctx, matchID)
	if err != nil {
		return nil, fmt.Errorf("failed to get match details: %w", err)
	}

	if matchDetails.State != "created" {
		return nil, fmt.Errorf("match is already resolved or cancelled")
	}

	// Determine winner and loser
	var loserID pgtype.UUID
	if winnerID.Bytes == matchDetails.ResumeAID.Bytes {
		loserID = matchDetails.ResumeBID
	} else if winnerID.Bytes == matchDetails.ResumeBID.Bytes {
		loserID = matchDetails.ResumeAID
	} else {
		return nil, fmt.Errorf("winner must be one of the match participants")
	}

	// Get resumes for Elo calculation 
	resumeIDs := []pgtype.UUID{matchDetails.ResumeAID, matchDetails.ResumeBID}
	resumes, err := s.db.GetResumesForEloUpdate(ctx, resumeIDs)
	if err != nil {
		return nil, fmt.Errorf("failed to get resumes for elo update: %w", err)
	}

	if len(resumes) != 2 {
		return nil, fmt.Errorf("expected 2 resumes, got %d", len(resumes))
	}

	
	// Map resumes by ID for easy access
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

	// Update both resumes atomically
	err = s.db.UpdateResumeEloStats(ctx, sqlc.UpdateResumeEloStatsParams{
		ID:    matchDetails.ResumeAID,
		CurrentEloInt: newEloA,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to update resume A: %w", err)
	}

	err = s.db.UpdateResumeEloStats(ctx, sqlc.UpdateResumeEloStatsParams{
		ID:    matchDetails.ResumeBID,
		CurrentEloInt: newEloB,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to update resume B: %w", err)
	}

	// Resolve the match - use pgtype.Int4 for nullable integers
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
	// Set defaults
	if limit <= 0 || limit > 100 {
		limit = 50
	}
	if battlesCount < 0 {
		battlesCount = 5
	}

	var industryStr, yoeBucketStr string
	if industry != nil {
		industryStr = *industry
	}
	if yoeBucket != nil {
		yoeBucketStr = *yoeBucket
	}

	resumes, err := s.db.GetLeaderboard(ctx, sqlc.GetLeaderboardParams{
		Industry:     industryStr,
		YoeBucket:    yoeBucketStr,
		BattlesCount: battlesCount,
		Limit:        limit,
		Offset:       offset,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to get leaderboard: %w", err)
	}

	return resumes, nil
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

