package resume_handler

type RenameResumeRequest struct {
	ResumeID string `json:"resume_id" binding:"required,uuid4"`
    NewName string  `json:"resume_name" binding:"required,alphanum,min=1,max=40"`
}

