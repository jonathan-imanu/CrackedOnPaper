package image

import (
	"context"
	"main/service/spaces"

	"go.uber.org/zap"
)

type ImageService struct {
	log *zap.Logger
	webpBucket *spaces.WebpBucket
}

func NewImageService(log *zap.Logger, webpBucket *spaces.WebpBucket) *ImageService {
	if log == nil || webpBucket == nil {
		panic("log and webpBucket must be non-nil")
	}
	return &ImageService{log: log, webpBucket: webpBucket}
}

// Convert a PDF to a webp image of varying sizes.
func (s *ImageService) ConvertPDFToWebp(ctx context.Context, resumeID, ver, hash, objectName, filePath string) error {
	// TODO: Implement this
	return nil
}