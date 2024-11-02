// templates/go/fiber-api/files/internal/config/config.go
package config

import (
	"github.com/a/a/internal/app"
	"github.com/joho/godotenv"
	"os"
)

func Load() (*app.Config, error) {
	// Load .env file if it exists
	godotenv.Load()

	return &app.Config{
		Environment: getEnv("ENV", "development"),
		Debug:       getEnv("DEBUG", "true") == "true",
	}, nil
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}