package resume

import (
	"context"
	"fmt"

	sqlc "main/db/sqlc"
	"main/service/image"
	"main/utils"

	"github.com/jackc/pgx/v5/pgtype"
)

type ResumeService struct {
	db *sqlc.Queries
}

func NewResumeService(db *sqlc.Queries) *ResumeService {
	return &ResumeService{db: db}
}

// Users can have up to 3 resumes.
func (s *ResumeService) FindFreeSlotForOwner(ctx context.Context, ownerUserID interface{}) (int16, error) {
	var uuid pgtype.UUID
	
	switch v := ownerUserID.(type) {
	case pgtype.UUID:
		uuid = v
	case string:
		if err := uuid.Scan(v); err != nil {
			return 0, fmt.Errorf("invalid UUID string: %w", err)
		}
	default:
		return 0, fmt.Errorf("unsupported type for ownerUserID: %T", ownerUserID)
	}
	
	return s.db.FindFreeSlotForOwner(ctx, uuid)
}

func (s *ResumeService) CreateResume(ctx context.Context, ownerUserID string, name, industry, yoeBucket string, pdfMetadata *utils.PDFMetadata, imageMetadata *image.ImageMetadata) (*sqlc.AppResume, error) {
	builtResume, err := s.buildResume(
		ctx,
		ownerUserID,
		name,
		industry,
		yoeBucket,
		pdfMetadata,
		imageMetadata,
	)

	if err != nil {
		return nil, err
	}

	createdResume, err := s.db.CreateResumeWithSlot(ctx, sqlc.CreateResumeWithSlotParams{
		OwnerUserID:   builtResume.OwnerUserID,
		Slot:          builtResume.Slot,
		Name:          builtResume.Name,
		Industry:      builtResume.Industry,
		YoeBucket:     builtResume.YoeBucket,
		PdfStorageKey: builtResume.PdfStorageKey,
		PdfSizeBytes:  builtResume.PdfSizeBytes,
		Column8:       builtResume.PdfMime,
		ImageKeyPrefix: builtResume.ImageKeyPrefix,
		Column10:      builtResume.PageCount,
		Column11:      builtResume.ImageReady,
	})

	if err != nil {
		return nil, err
	}

	return &createdResume, nil
}

func (s *ResumeService) GetResume(ctx context.Context, userID string, resumeID string) (*sqlc.AppResume, error) {
	userIDUUID, err := utils.ConvertStringToUUID(userID)
	if err != nil {
		return nil, err
	}

	resumeIDUUID, err := utils.ConvertStringToUUID(resumeID)
	if err != nil {
		return nil, err
	}

	resume, err := s.db.GetResumeByIDForOwner(ctx, sqlc.GetResumeByIDForOwnerParams{
		ID: resumeIDUUID,
		OwnerUserID: userIDUUID,
	})

	if err != nil {
		return nil, err
	}

	return &resume, nil
}

func (s *ResumeService) DeleteResume(ctx context.Context, userID string, resumeID string) error {

	userIDUUID, err := utils.ConvertStringToUUID(userID)
	if err != nil {
		return err
	}
	
	resumeIDUUID, err := utils.ConvertStringToUUID(resumeID)
	if err != nil {
		return err
	}

	return s.db.DeleteResumeByIDForOwner(ctx, sqlc.DeleteResumeByIDForOwnerParams{
		ID: resumeIDUUID,
		OwnerUserID: userIDUUID,
	})
}

func (s *ResumeService) UpdateImageMetadataForResume(ctx context.Context, userID string, resumeID string, imageMetadata *image.ImageMetadata) error {

	userIDUUID, err := utils.ConvertStringToUUID(userID)
	if err != nil {
		return err
	}

	resumeIDUUID, err := utils.ConvertStringToUUID(resumeID)
	if err != nil {
		return err
	}
	
	_, err = s.db.UpdateResumeImageMeta(ctx, sqlc.UpdateResumeImageMetaParams{
		ID: resumeIDUUID,
		OwnerUserID: userIDUUID,
		ImageKeyPrefix: imageMetadata.ImageKeyPrefix,
		ImageReady: imageMetadata.ImageReady,
	})

	return err
}

func (s *ResumeService) buildResume(ctx context.Context, ownerUserID string, name, industry, yoeBucket string, pdfMetadata *utils.PDFMetadata, imageMetadata *image.ImageMetadata) (*sqlc.AppResume, error) {
	userID, err := utils.ConvertStringToUUID(ownerUserID)
	if err != nil {
		return nil, err
	}
	
	slot, err := s.FindFreeSlotForOwner(ctx, userID)
	if err != nil {
		return nil, err
	}

	resume := &sqlc.AppResume{
		OwnerUserID:   userID,
		Name:          name,
		Industry:      industry,
		YoeBucket:     yoeBucket,
		PdfStorageKey: pdfMetadata.StorageKey,
		PdfSizeBytes:  pdfMetadata.SizeBytes,
		PdfMime:       pdfMetadata.MimeType,
		PageCount:     pdfMetadata.PageCount,
		ImageReady:    imageMetadata.ImageReady,
		ImageKeyPrefix: imageMetadata.ImageKeyPrefix,
		Slot:          slot,
		CurrentEloInt: 1000,	
		BattlesCount:  0,
		InFlight:      false,
	}

	return resume, nil
}