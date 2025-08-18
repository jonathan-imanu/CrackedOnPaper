package storage

import "mime/multipart"

type UploadResumeRequest struct {
    File       *multipart.FileHeader `form:"file" binding:"required"`
    UserID     string                `form:"user_id" binding:"required,uuid4"`
    ResumeName string                `form:"resume_name" binding:"required,alphanum,min=1,max=40"`
}