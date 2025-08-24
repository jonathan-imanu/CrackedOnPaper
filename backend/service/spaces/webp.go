package spaces

import (
	"bytes"
	"context"
	"fmt"
	"main/utils"
	"sync"

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
	Prefix(userID, resumeID, objectName string) string
	UploadBytes(ctx context.Context, userID, resumeID, objectName string, data []byte, contentType string) error
	DeleteWebp(ctx context.Context, imageKeyPrefix string) error
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

func (b *WebpBucket) Prefix(userID, resumeID, objectName string) string {
	// Data format: users/{userID}/resumes/{resumeId}/{objectName}
	return fmt.Sprintf("users/%s/resumes/%s/%s", userID, resumeID, objectName)
}

func (b *WebpBucket) UploadBytes(ctx context.Context, userID, resumeID, objectName string, data []byte, contentType string) error {
	fullKey := b.Prefix(userID, resumeID, objectName)

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

func (b *WebpBucket) DeleteWebp(ctx context.Context, imageKeyPrefix string) error {
	_, err := b.Client.DeleteObject(ctx, &s3.DeleteObjectInput{
		Bucket: aws.String(b.Name),
		Key: aws.String(imageKeyPrefix),
	})
	if err != nil {
		b.log.Error("Failed to delete webp from webp bucket", 
			zap.String("key", imageKeyPrefix),
			zap.Error(err))
		return fmt.Errorf("failed to delete webp from webp bucket: %w", err)
	}

	return nil
}

var _ WebpBucketOps = (*WebpBucket)(nil)