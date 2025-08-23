package image

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"main/service/spaces"
	"mime/multipart"

	"github.com/chai2010/webp"
	"github.com/disintegration/imaging"
	"github.com/gen2brain/go-fitz"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"go.uber.org/zap"
)

type ImageMetadata struct {
	ImageReady bool
	ImageKeyPrefix pgtype.Text
}

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

// TODO: Implement this

// Convert a PDF to a webp image of varying sizes.
func (s *ImageService) ConvertPDFToWebp(ctx context.Context, file *multipart.FileHeader) (string, error) {
	if file == nil {
		s.log.Error("File is nil")
		return "", errors.New("file is nil")
	}

	// Open the uploaded file 
	src, err := file.Open()
	if err != nil {
		s.log.Error("Failed to open file", zap.Error(err))
		return "", fmt.Errorf("failed to open file: %w", err)
	}
	defer src.Close()

	// Read file content
	fileBytes := make([]byte, file.Size)
	_, err = io.ReadFull(src, fileBytes)
	if err != nil {
		return "", fmt.Errorf("failed to read file: %w", err)
	}

	// Create a new document from the PDF bytes using go-fitz
	doc, err := fitz.NewFromMemory(fileBytes)
	if err != nil {
		s.log.Error("Failed to create PDF document", zap.Error(err))
		return "", fmt.Errorf("failed to parse PDF: %w", err)
	}
	defer doc.Close()

	// Get first page
	img, err := doc.Image(0)
	if err != nil {
		s.log.Error("Failed to render PDF page", zap.Error(err))
		return "", fmt.Errorf("failed to render PDF page: %w", err)
	}

	const (
		defaultImageWidth = 800
		webpQuality = 90
	)

	// Resize to standard resume preview size (e.g., 800px width, maintain aspect ratio)
	resized := imaging.Resize(img, defaultImageWidth, 0, imaging.Lanczos)

	// Convert to WebP format
	var webpBuffer bytes.Buffer
	err = webp.Encode(&webpBuffer, resized, &webp.Options{
		Lossless: false,
		Quality: float32(webpQuality),
	})
	if err != nil {
		return "", fmt.Errorf("failed to encode as WebP: %w", err)
	}

	// Generate unique identifiers for the resume
	resumeID := uuid.New().String()
	version := "v1"
	hash := "initial"
	filename := "preview.webp"

	// Upload to DigitalOcean Spaces
	err = s.webpBucket.UploadBytes(ctx, resumeID, version, hash, filename, webpBuffer.Bytes(), "image/webp")
	if err != nil {
		s.log.Error("Failed to upload WebP to bucket", zap.Error(err))
		return "", fmt.Errorf("failed to upload WebP: %w", err)
	}

	s.log.Info("Successfully converted PDF to WebP", 
		zap.String("resume_id", resumeID),
		zap.String("filename", filename),
		zap.Int("webp_size_bytes", webpBuffer.Len()),
	)

	return resumeID, nil // Return resumeID for database storage

}
