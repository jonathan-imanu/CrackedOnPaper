package spaces

import (
	"bytes"
	"context"
	"fmt"
	"main/utils"
	"os"
	"sync"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	"go.uber.org/zap"
)

// ---------------- Webp bucket clients ----------------

// Data is stored in the format: resumes/{resumeId}/{ver}-{hash}/
// Under this, there are webp files of varying sizes.
// The hash is used to avoid overly aggressive CDN caching between different versions of the same resume.

type WebpBucket struct {
	BucketClient
}

// Singleton pattern to ensure only one instance of the webp bucket is created.
var (
	webpOnce   sync.Once
	webpBucket *WebpBucket
	webpErr    error
)

// IMPORTANT: Methods in this bucket take into account the format of the objects in the bucket.
type WebpBucketOps interface {
	ListWebpSet(ctx context.Context, resumeID, ver, hash string) ([]types.Object, error)
	UploadWebp(ctx context.Context, resumeID, ver, hash, objectName, filePath string) error
	DeleteWebpSet(ctx context.Context, resumeID, ver, hash string) error
	DeleteAllWebpsForResume(ctx context.Context, resumeID string) error
}

func GetWebpBucket(ctx context.Context, log *zap.Logger, config *utils.Config) (*WebpBucket, error) {
	webpOnce.Do(func() {
		var base *BucketClient
		base, webpErr = createBucketClient(ctx, config.Webp.BucketName, config.Bucket.BucketRegion, config.Bucket.BucketEndpoint, config.Webp.AccessKeyID, config.Webp.AccessKeySecret, log)
		if webpErr != nil {
			log.Error("Failed to create webp bucket", zap.Error(webpErr))
			return
		}
		webpBucket = &WebpBucket{BucketClient: *base}
	})
	return webpBucket, webpErr
}

func (b *WebpBucket) prefix(resumeID, ver, hash string) string {
	// Data format: resumes/{resumeId}/{ver}-{hash}/
	seg := ver
	if hash != "" {
		seg = fmt.Sprintf("%s-%s", ver, hash)
	}
	return fmt.Sprintf("resumes/%s/%s/", resumeID, seg)
}

// List all webp objects for a resume version/hash set.
func (b *WebpBucket) ListWebpSet(ctx context.Context, resumeID, ver, hash string) ([]types.Object, error) {
	prefix := b.prefix(resumeID, ver, hash)
	return b.ListObjects(ctx, b.Name, prefix, "")
}

// Upload a single webp into a version/hash set.
// Sets long-lived cache headers since keys are content-addressed by {ver}-{hash}.
func (b *WebpBucket) UploadWebp(ctx context.Context, resumeID, ver, hash, objectName, filePath string) error {
	fullKey := b.prefix(resumeID, ver, hash) + objectName

	file, err := os.Open(filePath)
	if err != nil {
		return fmt.Errorf("open %q: %w", filePath, err)
	}
	defer file.Close()

	cache := "public, max-age=31536000, immutable"

	_, err = b.Client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:       aws.String(b.Name),
		Key:          aws.String(fullKey),
		Body:         file,
		ContentType:  aws.String("image/webp"),
		CacheControl: aws.String(cache),
	})
	if err != nil {
		return err
	}

	return s3.NewObjectExistsWaiter(b.Client).Wait(ctx, &s3.HeadObjectInput{
		Bucket: aws.String(b.Name),
		Key:    aws.String(fullKey),
	}, time.Minute)
}

// Delete all webps for a version/hash set.
func (b *WebpBucket) DeleteWebpSet(ctx context.Context, resumeID, ver, hash string) error {
	objs, err := b.ListWebpSet(ctx, resumeID, ver, hash)
	if err != nil {
		return err
	}
	return b.deleteInChunks(ctx, objs)
}

// Delete ALL webps for a resume across every version/hash
func (b *WebpBucket) DeleteAllWebpsForResume(ctx context.Context, resumeID string) error {
	prefix := fmt.Sprintf("resumes/%s/", resumeID)
	objs, err := b.ListObjects(ctx, b.Name, prefix, "")
	if err != nil {
		return err
	}
	return b.deleteInChunks(ctx, objs)
}

func (b *WebpBucket) UploadBytes(ctx context.Context, resumeID, ver, hash, objectName string, data []byte, contentType string) error {
	fullKey := b.prefix(resumeID, ver, hash) + objectName

	_, err := b.Client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(b.Name),
		Key:         aws.String(fullKey),
		Body:       bytes.NewReader(data),
		ContentType: aws.String(contentType),
		CacheControl: aws.String("public, max-age=31536000, immutable"),
		ACL: 	  types.ObjectCannedACLPublicRead,
	})
	if err != nil {
		b.log.Error("Failed to upload bytes to webp bucket", 
			zap.String("key", fullKey),
			zap.Error(err))
		return fmt.Errorf("failed to upload bytes to webp bucket: %w", err)
	}

	return nil
}

var _ WebpBucketOps = (*WebpBucket)(nil)