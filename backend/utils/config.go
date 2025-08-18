package utils

import (
	"fmt"
	"os"
)

type BucketConfig struct {
	BucketEndpoint string
	BucketRegion   string
}

type ResumeConfig struct {
	BucketName      string
	AccessKeyID     string
	AccessKeySecret string
}

type WebpConfig struct {
	BucketName      string
	AccessKeyID     string
	AccessKeySecret string
}

type SupabaseConfig struct {
	URL      string
	Key      string
	JWTSecret string
}

type Config struct {
	Resume   *ResumeConfig
	Webp     *WebpConfig
	Bucket   *BucketConfig
	Supabase *SupabaseConfig
}

func LoadConfig() (*Config, error) {
	bucketConfig := &BucketConfig{
		BucketEndpoint: os.Getenv("BUCKET_ENDPOINT"),
		BucketRegion:   os.Getenv("BUCKET_REGION"),
	}

	resumeConfig := &ResumeConfig{
		BucketName:      os.Getenv("CRUD_RESUMES_BUCKET"),
		AccessKeyID:     os.Getenv("CRUD_RESUMES_ACCESS_KEY_ID"),
		AccessKeySecret: os.Getenv("CRUD_RESUMES_ACCESS_KEY_SECRET"),
	}

	webpConfig := &WebpConfig{
		BucketName:      os.Getenv("CRUD_WEBP_BUCKET"),
		AccessKeyID:     os.Getenv("CRUD_WEBP_ACCESS_KEY_ID"),
		AccessKeySecret: os.Getenv("CRUD_WEBP_ACCESS_KEY_SECRET"),
	}

	supabaseConfig := &SupabaseConfig{
		URL:      os.Getenv("SUPABASE_URL"),
		Key:      os.Getenv("SUPABASE_KEY"),
		JWTSecret: os.Getenv("SUPABASE_JWT_SECRET"),
	}

	config := &Config{
		Resume:   resumeConfig,
		Webp:     webpConfig,
		Bucket:   bucketConfig,
		Supabase: supabaseConfig,
	}

	// Validate required environment variables
	if err := validateConfig(config); err != nil {
		return nil, err
	}

	return config, nil
}

func validateConfig(config *Config) error {
	// Validate Resume bucket config
	if config.Resume.BucketName == "" {
		return fmt.Errorf("CRUD_RESUMES_BUCKET environment variable is required")
	}
	if config.Resume.AccessKeyID == "" {
		return fmt.Errorf("CRUD_RESUMES_ACCESS_KEY_ID environment variable is required")
	}
	if config.Resume.AccessKeySecret == "" {
		return fmt.Errorf("CRUD_RESUMES_ACCESS_KEY_SECRET environment variable is required")
	}

	// Validate Webp bucket config
	if config.Webp.BucketName == "" {
		return fmt.Errorf("CRUD_WEBPS_BUCKET environment variable is required")
	}
	if config.Webp.AccessKeyID == "" {
		return fmt.Errorf("CRUD_WEBPS_ACCESS_KEY_ID environment variable is required")
	}
	if config.Webp.AccessKeySecret == "" {
		return fmt.Errorf("CRUD_WEBPS_ACCESS_KEY_SECRET environment variable is required")
	}

	// Validate shared bucket config
	if config.Bucket.BucketEndpoint == "" {
		return fmt.Errorf("BUCKET_ENDPOINT environment variable is required")
	}
	if config.Bucket.BucketRegion == "" {
		return fmt.Errorf("BUCKET_REGION environment variable is required")
	}

	// Validate Supabase config
	if config.Supabase.JWTSecret == "" {
		return fmt.Errorf("SUPABASE_JWT_SECRET environment variable is required")
	}

	return nil
}