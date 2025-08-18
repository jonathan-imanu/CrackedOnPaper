package middleware

import (
	"context"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

type ctxKeyLogger struct{}

func LoggerFrom(ctx context.Context) *zap.Logger {
	l, _ := ctx.Value(ctxKeyLogger{}).(*zap.Logger)
	return l
}

func RequestLogger(base *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		reqID := c.GetHeader("X-Request-ID")
		if reqID == "" {
			reqID = uuid.NewString()
			c.Writer.Header().Set("X-Request-ID", reqID)
		}

		reqLog := base.With(
			zap.String("req_id", reqID),
			zap.String("method", c.Request.Method),
			zap.String("path", c.FullPath()), // falls back to "" if no named route
			zap.String("client_ip", c.ClientIP()),
		)

		ctx := context.WithValue(c.Request.Context(), ctxKeyLogger{}, reqLog)
		c.Request = c.Request.WithContext(ctx)

		start := time.Now()
		c.Next()

		latency := time.Since(start)
		status := c.Writer.Status()

		reqLog.Info("request completed",
			zap.Int("status", status),
			zap.Duration("latency", latency),
			zap.Int("bytes_out", c.Writer.Size()),
			zap.String("user_agent", c.Request.UserAgent()),
		)
	}
}