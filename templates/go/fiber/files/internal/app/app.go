// templates/go/fiber-api/files/internal/app/app.go
package app

import (
	"{{module_path}}/internal/handlers"
	"{{module_path}}/internal/middleware"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func New(cfg *Config) *fiber.App {
	app := fiber.New(fiber.Config{
		ErrorHandler: handlers.ErrorHandler,
	})

	// Middleware
	app.Use(recover.New())
	app.Use(logger.New())
	app.Use(cors.New())
	
	// Custom middleware
	app.Use(middleware.RequestID())

	// Routes
	api := app.Group("/api")
	v1 := api.Group("/v1")

	// Register route handlers
	handlers.RegisterRoutes(v1)

	return app
}

type Config struct {
	// Add your configuration fields here
	Environment string
	Debug       bool
}