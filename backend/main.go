package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
	"go.uber.org/zap"

	"main/handlers/storage"
	"main/middleware"
	"main/service/spaces"
	"main/utils"
)

var emailCtxKey = "email"

func main() {
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: Error loading .env file: %v", err)
	}

	logger := utils.Logger()

	logger.Info("Starting server")
	defer func() { _ = logger.Sync() }()

	corsConfig := cors.Config{
		AllowOrigins: []string{os.Getenv("APP_URL")},
		AllowHeaders: []string{"Origin", "Content-Length", "Content-Type", "Authorization"},
	}

	config, err := utils.LoadConfig()
	if err != nil {
		log.Fatal("Failed to load config", zap.Error(err))
	}

	router := gin.New()
	router.Use(cors.New(corsConfig))
	router.Use(middleware.RequestLogger(logger))

	api := router.Group("/api")

	resumeBucket, err := spaces.GetResumeBucket(context.Background(), logger, config)
	if err != nil {
		log.Fatal("Failed to create resume bucket", zap.Error(err))
	}

	webpBucket, err := spaces.GetWebpBucket(context.Background(), logger, config)
	if err != nil {
		log.Fatal("Failed to create webp bucket", zap.Error(err))
	}
	
	// TODO: Use webpBucket for webp operations when implemented
	_ = webpBucket // Suppress unused variable warning

	storageHandler := storage.NewStorageHandler(resumeBucket, logger)
	storageHandler.RegisterRoutes(api)

	api.GET("/ping", func(c *gin.Context) {
		c.String(http.StatusOK, "pong")
	})

	// TODO: Move this & all auth to a separate module.
	api.POST("/secret", authMiddleware(config.Supabase.JWTSecret), secretRouteHandler())

	if err := router.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}

func authMiddleware(hmacSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Read the Authorization header
		token := c.GetHeader("Authorization")
		if token == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		// Validate token
		email, err := parseJWTToken(token, []byte(hmacSecret))

		if err != nil {
			log.Printf("Error parsing token: %s", err)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}

		log.Printf("Received request from %s", email)

		// Save the email in the context to use later in the handler
		ctx := context.WithValue(c, emailCtxKey, email)
		c.Request = c.Request.WithContext(ctx)

		// Authenticated. Continue (call next handler)
		c.Next()
	}
}

func secretRouteHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get the email from the context
		email := c.GetString(emailCtxKey)

		// Return the secret message
		c.JSON(200, gin.H{
			"message": "our hidden value for the user " + email,
		})
	}
}

// List of claims that we want to parse from the JWT token.
// The RegisteredClaims struct contains the standard claims.
// See https://pkg.go.dev/github.com/golang-jwt/jwt/v5#RegisteredClaims
type Claims struct {
	Email string `json:"email"`
	jwt.RegisteredClaims
}

// This function parses the JWT token and returns the email claim
func parseJWTToken(token string, hmacSecret []byte) (email string, err error) {
	// Parse the token and validate the signature
	t, err := jwt.ParseWithClaims(token, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return hmacSecret, nil
	})

	// Check if the token is valid
	if err != nil {
		return "", fmt.Errorf("error validating token: %v", err)
	} else if claims, ok := t.Claims.(*Claims); ok {
		return claims.Email, nil
	}

	return "", fmt.Errorf("error parsing token: %v", err)
}
