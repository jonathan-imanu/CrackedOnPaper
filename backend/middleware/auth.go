package middleware

import (
	"context"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.uber.org/zap"

	"main/service/auth"
)

type EmailContextKey struct{}

func AuthMiddleware(authService *auth.AuthService, logger *zap.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.GetHeader("Authorization")
		if token == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		email, err := authService.ParseJWTToken(token)
		if err != nil {
			logger.Error("Error parsing token", zap.Error(err))
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		logger.Info("Received authenticated request", zap.String("email", email))

		ctx := context.WithValue(c.Request.Context(), EmailContextKey{}, email)
		c.Request = c.Request.WithContext(ctx)

		c.Next()
	}
}

func GetEmailFromContext(ctx context.Context) (string, bool) {
	email, ok := ctx.Value(EmailContextKey{}).(string)
	return email, ok
}
