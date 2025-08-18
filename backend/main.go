package main

import (
	"context"
	"log"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"go.uber.org/zap"

	"main/handlers/storage"
	"main/middleware"
	"main/service/auth"
	"main/service/spaces"
	"main/utils"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: Error loading .env file: %v", err)
	}

	logger := utils.Logger()

	logger.Info("Starting server")
	defer func() { _ = logger.Sync() }()

	corsConfig := cors.Config{
		AllowOrigins: []string{"http://localhost:3000"},
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

	authService := auth.NewAuthService(config.Supabase.JWTSecret)

	storageHandler := storage.NewStorageHandler(resumeBucket, logger, middleware.AuthMiddleware(authService, logger))
	storageHandler.RegisterRoutes(api)

	api.GET("/ping", func(c *gin.Context) {
		c.String(http.StatusOK, "pong")
	})

	if err := router.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}


