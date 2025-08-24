package utils

import (
	"bytes"
	"context"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"path/filepath"
	"strings"
	"time"

	"github.com/jackc/pgx/v5/pgtype"
	"rsc.io/pdf"
)

const (
	MAX_RESUME_FILE_SIZE int64 = 1024 * 1024 // 1 MB
	MAX_RESUME_PAGES     int16 = 2
	PARSE_TIMEOUT        time.Duration = 750 * time.Millisecond
)

type PDFMetadata struct {
	PageCount  int16
	StorageKey pgtype.Text
	SizeBytes  pgtype.Int8
	MimeType   string
}

// ValidateResumeFile checks that resume file is not too large and has a valid number of pages
func ValidateResumeFile(file *multipart.FileHeader) (*PDFMetadata, error) {
	if file.Size > MAX_RESUME_FILE_SIZE {
		return nil, errors.New("file is too large")
	}

	// Check that the file is a PDF from the content type
	if file.Header.Get("Content-Type") != "application/pdf" {
		return nil, errors.New("file is not a PDF")
	}

	src, err := file.Open()
	if err != nil {
		return nil, fmt.Errorf("open upload: %w", err)
	}
	defer src.Close()

	// Copy the file to a buffer and check that it's not too large
	var buf bytes.Buffer
	if _, err := io.CopyN(&buf, src, MAX_RESUME_FILE_SIZE+1); err != nil && err != io.EOF {
		return nil, fmt.Errorf("read upload: %w", err)
	}
	if int64(buf.Len()) > MAX_RESUME_FILE_SIZE {
		return nil, errors.New("file is too large")
	}

	// Double check that the file is a PDF since clients can lie about the content type
	head := buf.Bytes()
	if ct := http.DetectContentType(head); ct != "application/pdf" && ct != "application/octet-stream" {
		return nil, errors.New("file must be a PDF")
	}

	if !bytes.HasPrefix(head, []byte("%PDF-")) {
		return nil, errors.New("invalid PDF header")
	}

	pageCount, err := CountPDFPagesWithTimeout(head, PARSE_TIMEOUT)
	if err != nil {
		return nil, errors.New("could not read PDF (corrupted or unsupported)")
	}
	if pageCount <= 0 {
		return nil, errors.New("PDF has no pages or is invalid")
	}
	if int16(pageCount) > MAX_RESUME_PAGES {
		return nil, fmt.Errorf("resume is too long: %d pages (max %d)", pageCount, MAX_RESUME_PAGES)
	}

	return &PDFMetadata{
		PageCount:  int16(pageCount),
		StorageKey: pgtype.Text{String: "TODO", Valid: true},
		SizeBytes:  pgtype.Int8{Int64: int64(file.Size), Valid: true},
		MimeType:   file.Header.Get("Content-Type"),
	}, nil
}

// MimeTypeForFilename returns the MIME type for a given filename
func MimeTypeForFilename(name, fallback string) string {
	// Minimal inference without importing extra deps.
	ext := strings.ToLower(filepath.Ext(name))
	switch ext {
	case ".pdf":
		return "application/pdf"
	case ".doc":
		return "application/msword"
	case ".docx":
		return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
	case ".txt":
		return "text/plain"
	case ".md":
		return "text/markdown"
	case ".json":
		return "application/json"
	case ".html", ".htm":
		return "text/html"
	case ".png":
		return "image/png"
	case ".jpg", ".jpeg":
		return "image/jpeg"
	case ".webp":
		return "image/webp"
	default:
		if fallback != "" {
			return fallback
		}
		return "application/octet-stream"
	}
}

// CountPDFPagesWithTimeout counts the number of pages in a PDF with a timeout
func CountPDFPagesWithTimeout(data []byte, d time.Duration) (int, error) {
	ctx, cancel := context.WithTimeout(context.Background(), d)
	defer cancel()

	type result struct {
		n   int
		err error
	}

	ch := make(chan result, 1)

	go func() {
		// Panic safety in case the parser hits an edge case
		defer func() {
			if r := recover(); r != nil {
				ch <- result{0, fmt.Errorf("pdf parser panic: %v", r)}
			}
		}()
		rd := bytes.NewReader(data) // *bytes.Reader implements io.ReaderAt
		// rsc.io/pdf requires ReaderAt + size
		doc, err := pdf.NewReader(rd, int64(len(data)))
		if err != nil {
			ch <- result{0, err}
			return
		}
		ch <- result{doc.NumPage(), nil}
	}()

	select {
	case <-ctx.Done():
		return 0, errors.New("pdf parse timeout")
	case r := <-ch:
		return r.n, r.err
	}
}
