package main

import (
	"log"
	"os"

	"github.com/a/a/internal/app"
	"github.com/a/a/internal/config"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Create and setup application
	app := app.New(cfg)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}
	
	log.Printf("Server starting on port %s", port)
	if err := app.Listen(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}