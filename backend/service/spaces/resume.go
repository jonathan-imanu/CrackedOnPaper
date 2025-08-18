package spaces

import (
	"context"
	"fmt"
	"main/utils"
	"mime/multipart"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	"go.uber.org/zap"
)

// ---------------- Resume bucket clients ----------------

// Data is stored in the format: {userId}/resumes/{resumeId}/{ver}/

type ResumeBucket struct {
	BucketClient
}

// IMPORTANT: Methods in this bucket take into account the format of the objects in the bucket.
type ResumeBucketOps interface {
	ListResumeVersionObjects(ctx context.Context, userID, resumeID string) ([]types.Object, error)
	ListResumeObjects(ctx context.Context, userID, resumeID string) ([]types.Object, error)
	DeleteResumeVersion(ctx context.Context, userID, resumeID string) error
	DeleteResume(ctx context.Context, userID, resumeID string) error
	UploadResumeAsset(ctx context.Context, userID, resumeName string, file *multipart.FileHeader) error
}

// Singleton pattern to ensure only one instance of the resume bucket is created.
var (
	resumeOnce   sync.Once
	resumeBucket *ResumeBucket
	resumeErr    error
)

func GetResumeBucket(ctx context.Context, log *zap.Logger, config *utils.Config) (*ResumeBucket, error) {
	resumeOnce.Do(func() {
		var base *BucketClient
		base, resumeErr = createBucketClient(ctx, config.Resume.BucketName, config.Bucket.BucketRegion, config.Bucket.BucketEndpoint, config.Resume.AccessKeyID, config.Resume.AccessKeySecret, log)
		if resumeErr != nil {
			log.Error("Failed to create resume bucket", zap.Error(resumeErr))
			return
		}
		resumeBucket = &ResumeBucket{BucketClient: *base}
	})
	return resumeBucket, resumeErr
}

func (b *ResumeBucket) prefix(userID, resumeID string) string {
	base := fmt.Sprintf("%s/resumes", userID)
	if resumeID != "" {
		base = fmt.Sprintf("%s/%s", base, resumeID)
	}
	
	return base + "/"
}

// List all objects for a specific resume version.
func (b *ResumeBucket) ListResumeVersionObjects(ctx context.Context, userID, resumeID string) ([]types.Object, error) {
	prefix := b.prefix(userID, resumeID)
	return b.ListObjects(ctx, b.Name, prefix, "")
}

// List all objects for a whole resume (all versions).
func (b *ResumeBucket) ListResumeObjects(ctx context.Context, userID, resumeID string) ([]types.Object, error) {
	prefix := b.prefix(userID, resumeID)
	return b.ListObjects(ctx, b.Name, prefix, "")
}

// Delete a specific resume version (all objects under .../{ver}/).
func (b *ResumeBucket) DeleteResumeVersion(ctx context.Context, userID, resumeID string) error {
	objs, err := b.ListResumeVersionObjects(ctx, userID, resumeID)
	if err != nil {
		return err
	}
	return b.deleteInChunks(ctx, objs)
}

// Delete an entire resume (all versions).
func (b *ResumeBucket) DeleteResume(ctx context.Context, userID, resumeID string) error {
	objs, err := b.ListResumeObjects(ctx, userID, resumeID)
	if err != nil {
		return err
	}
	return b.deleteInChunks(ctx, objs)
}

// Upload a single file into a specific resume version under the given key name (relative to the version prefix).
func (b *ResumeBucket) UploadResumeAsset(ctx context.Context, userID, resumeName string, file *multipart.FileHeader) error {
	fullKey := b.prefix(userID, resumeName)

	ct := mimeTypeForFilename(file.Filename, "application/octet-stream")

	// Open the uploaded file
	src, err := file.Open()
	if err != nil {
		return fmt.Errorf("failed to open uploaded file: %w", err)
	}
	defer src.Close()

	_, err = b.Client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(b.Name),
		Key:         aws.String(fullKey),
		Body:        src,
		ContentType: aws.String(ct),
	})
	if err != nil {
		return fmt.Errorf("failed to upload file to S3: %w", err)
	}

	// Best-effort waiter

	waitCtx, cancel := context.WithTimeout(ctx, 2 * time.Second)
	defer cancel()

	if err := s3.NewObjectExistsWaiter(b.Client).Wait(waitCtx, &s3.HeadObjectInput{
		Bucket: aws.String(b.Name),
		Key:    aws.String(fullKey),
	}, 10 * time.Second); err != nil { // waiter’s backoff ceiling; waitCtx will cut it short
		b.log.Warn("Failed to wait for object to exist", zap.Error(err))
		return err
	}

	return nil
}

// Interfaces are implicit in Go.
var _ ResumeBucketOps = (*ResumeBucket)(nil)

// ---------------- Helper functions ----------------

func mimeTypeForFilename(name, fallback string) string {
	// Minimal inference without importing extra deps.
	ext := strings.ToLower(filepath.Ext(name))
	switch ext {
	case ".pdf":
		return "application/pdf"
	case ".doc":
		return "application/msword"
	case ".docx":
		return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
	case ".txt":
		return "text/plain"
	case ".md":
		return "text/markdown"
	case ".json":
		return "application/json"
	case ".html", ".htm":
		return "text/html"
	case ".png":
		return "image/png"
	case ".jpg", ".jpeg":
		return "image/jpeg"
	case ".webp":
		return "image/webp"
	default:
		if fallback != "" {
			return fallback
		}
		return "application/octet-stream"
	}
}