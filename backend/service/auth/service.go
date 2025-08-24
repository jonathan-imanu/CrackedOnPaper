package auth

import (
	"context"
	"fmt"
	"main/utils"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"go.uber.org/zap"
)

type Claims struct {
	UserID string `json:"sub"`
	Email  string `json:"email"`
	jwt.RegisteredClaims
}

type UserIDContextKey struct{}

type AuthService struct {
	hmacSecret []byte
	Log        *zap.Logger
}

func NewAuthService(hmacSecret string, log *zap.Logger) *AuthService {
	return &AuthService{
		hmacSecret: []byte(hmacSecret),
		Log:        log,
	}
}

func (s *AuthService) ParseJWTToken(c *gin.Context, raw string) error {
	s.Log.Debug("Parsing JWT token", zap.String("rawToken", raw))
	
	tokenStr := strings.TrimSpace(raw)
	if strings.HasPrefix(strings.ToLower(tokenStr), "bearer ") {
		tokenStr = strings.TrimSpace(tokenStr[7:])
	}
	tokenStr = strings.Trim(tokenStr, `"'`)

	s.Log.Debug("Cleaned token string", zap.String("tokenStr", tokenStr))

	if parts := strings.Split(tokenStr, "."); len(parts) != 3 {
		return fmt.Errorf("malformed token: expected 3 segments")
	}

	t, err := jwt.ParseWithClaims(tokenStr, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return s.hmacSecret, nil
	})
	if err != nil {
		return fmt.Errorf("error validating token: %w", err)
	}
	if !t.Valid {
		return fmt.Errorf("token is invalid")
	}

	claims, ok := t.Claims.(*Claims)
	s.Log.Info("JWT claims parsed", zap.Any("claims", claims), zap.Bool("ok", ok))
	if !ok {
		return fmt.Errorf("could not parse claims")
	}

	// Store user id in context
	ctx := context.WithValue(c.Request.Context(), UserIDContextKey{}, claims.UserID)
	c.Request = c.Request.WithContext(ctx)

	return nil
}

func (s *AuthService) AuthMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.GetHeader("Authorization")
		if token == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		err := s.ParseJWTToken(c, token)
		if err != nil {
			s.Log.Error("Error parsing token", zap.Error(err))
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		s.Log.Info("Received authenticated request")
		c.Next()
	}
}


func (s *AuthService) GetUserID(c *gin.Context) (pgtype.UUID, bool) {
    val := c.Request.Context().Value(UserIDContextKey{})
    s.Log.Debug("Context value for UserIDContextKey", zap.Any("value", val), zap.String("type", fmt.Sprintf("%T", val)))
    
    if userID, ok := val.(string); ok {
		s.Log.Debug("Successfully extracted user ID from context", zap.String("userID", userID))
		uuid, err := utils.ConvertStringToUUID(userID)
		if err != nil {
			s.Log.Error("Failed to convert user ID string to UUID", zap.String("userID", userID), zap.Error(err))
			return pgtype.UUID{}, false
		}
        return uuid, true
    }

    s.Log.Error("Failed to extract user ID from context - value is not a string", zap.Any("value", val))
    return pgtype.UUID{}, false
}

func (s *AuthService) GetUserIDString(c *gin.Context) (string, bool) {
	userID, ok := s.GetUserID(c)
	if !ok {
		return "", false
	}
	return userID.String(), true
}