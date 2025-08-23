package storage

import (
	"mime/multipart"
)

type UploadResumeRequest struct {
    File       *multipart.FileHeader `form:"file" binding:"required"`
    ResumeName string                `form:"resume_name" binding:"required,alphanum,min=1,max=40"`
    Industry   string                `form:"industry" binding:"required,alphanum,min=1,max=40"`
    YoeBucket  string                `form:"yoe_bucket" binding:"required,alphanum,min=1,max=40"`
}

type DeleteResumeRequest struct {
	ResumeID string `json:"resume_id" binding:"required,uuid4"`
}