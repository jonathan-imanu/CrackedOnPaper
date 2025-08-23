package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
	"go.uber.org/zap"

	db "main/db/sqlc"
	resume_handler "main/handlers/resume"
	"main/handlers/storage"
	"main/middleware"
	"main/service/auth"
	"main/service/resume"
	"main/service/spaces"
	"main/utils"
)

func main() {
	if err := godotenv.Load(); err != nil {
		fmt.Printf("Warning: Error loading .env file: %v", err)
	}

	logger := utils.Logger()

	logger.Info("Starting server")
	defer func() { _ = logger.Sync() }()

	corsConfig := cors.Config{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders: []string{"Origin", "Content-Length", "Content-Type", "Authorization"},
	}

	config, err := utils.LoadConfig()
	if err != nil {
		logger.Fatal("Failed to load config", zap.Error(err))
	}

	pool, err := pgxpool.New(context.Background(), os.Getenv("DATABASE_URL"))
    if err != nil {
		logger.Fatal("Failed to create connection pool", zap.Error(err))
    }
    defer pool.Close()

    db := db.New(pool)

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

	authService := auth.NewAuthService(config.Supabase.JWTSecret, logger)
	resumeService := resume.NewResumeService(db)

	storageHandler := storage.NewStorageHandler(resumeBucket, resumeService, authService, logger)
	storageHandler.RegisterRoutes(api)

	resumeHandler := resume_handler.NewResumeHandler(db, logger, authService)
	resumeHandler.RegisterRoutes(api)

	api.GET("/ping", authService.AuthMiddleware(), func(c *gin.Context) {
		c.String(http.StatusOK, "pong")
	})

	api.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "ok")
	})

	if err := router.Run(":8080"); err != nil {
		log.Fatal(err)
	}
}


