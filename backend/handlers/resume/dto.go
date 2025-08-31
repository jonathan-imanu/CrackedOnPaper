package resume_handler

type RenameResumeRequest struct {
	ResumeID string `json:"resume_id" binding:"required,uuid4"`
    NewName string  `json:"resume_name" binding:"required,string,min=1,max=40"`
}

type DeleteResumeRequest struct {
	ImageKeyPrefix string `json:"image_key_prefix" binding:"required"`
	PdfStorageKey string `json:"pdf_storage_key" binding:"required"`
}

