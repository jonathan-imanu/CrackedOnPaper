package spaces

import (
	"context"
	"fmt"
	"main/utils"
	"mime/multipart"
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
	DeleteResume(ctx context.Context, pdfStorageKey string) error
	UploadResumeAsset(ctx context.Context, userID, resumeName string, file *multipart.FileHeader) error
	Prefix(userID, resumeName string) string
	ValidateResumeFile(file *multipart.FileHeader) (*utils.PDFMetadata, error)
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

func (b *ResumeBucket) Prefix(userID, resumeName string) string {
	base := fmt.Sprintf("%s/resumes", userID)
	if resumeName != "" {
		base = fmt.Sprintf("%s/%s", base, resumeName)
	}
	
	return base + "/"
}


// Delete an entire resume (all versions).
func (b *ResumeBucket) DeleteResume(ctx context.Context, pdfStorageKey string) error {
	objs := []types.Object{
		{
			Key: aws.String(pdfStorageKey),
		},
	}
	return b.deleteInChunks(ctx, objs)
}

// Upload a single file into a specific resume version under the given key name (relative to the version prefix).
func (b *ResumeBucket) UploadResumeAsset(ctx context.Context, userID, resumeName string, file *multipart.FileHeader) error {
	fullKey := b.Prefix(userID, resumeName)

	ct := utils.MimeTypeForFilename(file.Filename, "application/pdf")

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

// ValidateResumeFile checks that resume file is not too large and has a valid number of pages
func (b *ResumeBucket) ValidateResumeFile(file *multipart.FileHeader) (*utils.PDFMetadata, error) {
	pdfMetadata, err := utils.ValidateResumeFile(file)
	if err != nil {
		b.log.Error("resume file validation failed", zap.Error(err))
		return nil, err
	}

	return pdfMetadata, nil
}

// Interfaces are implicit in Go.
var _ ResumeBucketOps = (*ResumeBucket)(nil)
