package spaces

import (
	"context"
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/aws/aws-sdk-go-v2/service/s3/types"
	"github.com/aws/smithy-go"
	"go.uber.org/zap"
)

// ---------------- Generic bucket client ----------------

type BucketClient struct {
	Client *s3.Client
	Name   string
	log    *zap.Logger
}

type BucketOps interface {
	ListObjects(ctx context.Context, bucketName string, prefix string, delimiter string) ([]types.Object, error)
	DeleteObjects(ctx context.Context, bucketName string, objectKeys []string) error
	UploadFile(ctx context.Context, bucketName string, objectKey string, fileName string) error
}

// createBucketClient creates a new bucket client with the given configuration
func createBucketClient(ctx context.Context, bucketName string, region string, endpoint string, accessKeyID string, accessKeySecret string, log *zap.Logger) (*BucketClient, error) {
	if bucketName == "" || accessKeyID == "" || accessKeySecret == "" {
		return nil, fmt.Errorf("bucketName, accessKeyID, and accessKeySecret must be set")
	}
	
	if region == "" || endpoint == "" {
		return nil, fmt.Errorf("region and endpoint must be set")
	}

	baseCfg, err := config.LoadDefaultConfig(ctx, config.WithRegion(region))
	if err != nil {
		return nil, err
	}

	baseURL := endpoint

	bucket := &BucketClient{
		Client: s3.NewFromConfig(baseCfg, func(o *s3.Options) {
			o.BaseEndpoint = aws.String(baseURL)
			o.UsePathStyle = true
			o.Credentials = aws.NewCredentialsCache(credentials.NewStaticCredentialsProvider(
				accessKeyID,
				accessKeySecret,
				"",
			))
		}),
		Name: bucketName,
		log:  log,
	}

	return bucket, nil
}

// ListObjects lists the objects in a bucket
func (bucket *BucketClient) ListObjects(ctx context.Context, bucketName string, prefix string, delimiter string) ([]types.Object, error) {
	var err error
	var output *s3.ListObjectsV2Output
	input := &s3.ListObjectsV2Input{
		Bucket:    aws.String(bucketName),
		Prefix:    aws.String(prefix),
		Delimiter: aws.String(delimiter),
	}
	var objects []types.Object
	objectPaginator := s3.NewListObjectsV2Paginator(bucket.Client, input)
	for objectPaginator.HasMorePages() {
		output, err = objectPaginator.NextPage(ctx)
		if err != nil {
			var noBucket *types.NoSuchBucket
			if errors.As(err, &noBucket) {
				bucket.log.Error("Bucket does not exist", zap.String("bucket", bucketName))
				err = noBucket
			}
			break
		} else {
			objects = append(objects, output.Contents...)
		}
	}
	return objects, err
}

// DeleteObjects deletes a list of objects from a bucket.
func (bucket *BucketClient) DeleteObjects(ctx context.Context, bucketName string, objectKeys []string) error {
	var objectIds []types.ObjectIdentifier
	for _, key := range objectKeys {
		objectIds = append(objectIds, types.ObjectIdentifier{Key: aws.String(key)})
	}
	output, err := bucket.Client.DeleteObjects(ctx, &s3.DeleteObjectsInput{
		Bucket: aws.String(bucketName),
		Delete: &types.Delete{Objects: objectIds, Quiet: aws.Bool(true)},
	})
	if err != nil || len(output.Errors) > 0 {
		bucket.log.Error("Error deleting objects from bucket", zap.String("bucket", bucketName))
		if err != nil {
			var noBucket *types.NoSuchBucket
			if errors.As(err, &noBucket) {
				bucket.log.Error("Bucket does not exist", zap.String("bucket", bucketName))
				err = noBucket
			}
		} else if len(output.Errors) > 0 {
			for _, outErr := range output.Errors {
				bucket.log.Error("Delete object error", 
					zap.String("key", *outErr.Key), 
					zap.String("message", *outErr.Message))
			}
			err = fmt.Errorf("%s", *output.Errors[0].Message)
		}
	} else {
		for _, delObjs := range output.Deleted {
			err = s3.NewObjectNotExistsWaiter(bucket.Client).Wait(
				ctx, &s3.HeadObjectInput{Bucket: aws.String(bucketName), Key: delObjs.Key}, time.Minute)
			if err != nil {
				bucket.log.Warn("Failed attempt to wait for object to be deleted", 
					zap.String("key", *delObjs.Key))
			} else {
				bucket.log.Info("Object deleted successfully", zap.String("key", *delObjs.Key))
			}
		}
	}
	return err
}

// Needed because S3 DeleteObjects is limited to 1000 keys per call.
func (bucket *BucketClient) deleteInChunks(ctx context.Context, objs []types.Object) error {
	const maxPerCall = 1000
	var keys []string
	for _, o := range objs {
		if o.Key != nil {
			keys = append(keys, *o.Key)
		}
	}
	for i := 0; i < len(keys); i += maxPerCall {
		end := i + maxPerCall
		if end > len(keys) {
			end = len(keys)
		}
		if err := bucket.DeleteObjects(ctx, bucket.Name, keys[i:end]); err != nil {
			return err
		}
	}
	return nil
}

func (bucket *BucketClient) UploadFile(ctx context.Context, bucketName string, objectKey string, fileName string) error {
	file, err := os.Open(fileName)
	if err != nil {
		bucket.log.Error("Couldn't open file to upload", 
			zap.String("fileName", fileName), 
			zap.Error(err))
		return err
	}
	defer file.Close()
	
	_, err = bucket.Client.PutObject(ctx, &s3.PutObjectInput{
		Bucket: aws.String(bucketName),
		Key:    aws.String(objectKey),
		Body:   file,
	})
	if err != nil {
		var apiErr smithy.APIError
		if errors.As(err, &apiErr) && apiErr.ErrorCode() == "EntityTooLarge" {
			bucket.log.Error("Object is too large for upload", 
				zap.String("bucket", bucketName),
				zap.String("message", "To upload objects larger than 5GB, use the S3 console (160GB max) or the multipart upload API (5TB max)"))
		} else {
			bucket.log.Error("Couldn't upload file", 
				zap.String("fileName", fileName), 
				zap.String("bucket", bucketName), 
				zap.String("objectKey", objectKey), 
				zap.Error(err))
		}
		return err
	}
	
	err = s3.NewObjectExistsWaiter(bucket.Client).Wait(
		ctx, &s3.HeadObjectInput{Bucket: aws.String(bucketName), Key: aws.String(objectKey)}, time.Minute)
	if err != nil {
		bucket.log.Warn("Failed attempt to wait for object to exist", zap.String("objectKey", objectKey))
	}
	
	return err
}


var _ BucketOps = (*BucketClient)(nil)
