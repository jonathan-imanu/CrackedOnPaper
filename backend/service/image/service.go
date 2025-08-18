package image

import (
	"context"
	"errors"
	"main/service/spaces"
	"mime/multipart"

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
func (s *ImageService) ConvertPDFToWebp(ctx context.Context, file *multipart.FileHeader) error {
	if file == nil {
		s.log.Error("File is nil")
		return errors.New("file is nil")
	}

	// TODO: Implement this
	return nil
}