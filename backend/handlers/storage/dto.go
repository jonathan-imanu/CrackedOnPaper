package storage

type UploadResumeRequest struct {
    UserID     string `form:"user_id" binding:"required,uuid4"`      
    Version    string `form:"version" binding:"required,alphanum"`    
    ResumeName string `form:"resume_name" binding:"required,alpha"`  
}
