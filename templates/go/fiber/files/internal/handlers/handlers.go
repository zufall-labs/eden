// templates/go/fiber-api/files/internal/handlers/handlers.go
package handlers

import (
	"github.com/gofiber/fiber/v2"
)

func RegisterRoutes(router fiber.Router) {
	// Health check
	router.Get("/health", HealthCheck)

	// Items routes
	items := router.Group("/items")
	items.Get("/", ListItems)
	items.Post("/", CreateItem)
	items.Get("/:id", GetItem)
	items.Put("/:id", UpdateItem)
	items.Delete("/:id", DeleteItem)
}

func HealthCheck(c *fiber.Ctx) error {
	return c.JSON(fiber.Map{
		"status": "ok",
	})
}

// Example item struct
type Item struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
}

func ListItems(c *fiber.Ctx) error {
	// Example response
	items := []Item{
		{ID: "1", Name: "Item 1", Description: "Description 1"},
		{ID: "2", Name: "Item 2", Description: "Description 2"},
	}
	return c.JSON(items)
}

func CreateItem(c *fiber.Ctx) error {
	var item Item
	if err := c.BodyParser(&item); err != nil {
		return ErrorResponse(c, fiber.StatusBadRequest, "Invalid request body")
	}
	// Add validation and persistence logic here
	return c.Status(fiber.StatusCreated).JSON(item)
}

func GetItem(c *fiber.Ctx) error {
	id := c.Params("id")
	// Add retrieval logic here
	item := Item{
		ID:          id,
		Name:        "Example Item",
		Description: "Example Description",
	}
	return c.JSON(item)
}

func UpdateItem(c *fiber.Ctx) error {
	id := c.Params("id")
	var item Item
	if err := c.BodyParser(&item); err != nil {
		return ErrorResponse(c, fiber.StatusBadRequest, "Invalid request body")
	}
	item.ID = id
	// Add update logic here
	return c.JSON(item)
}

func DeleteItem(c *fiber.Ctx) error {
	// Add deletion logic here
	return c.SendStatus(fiber.StatusNoContent)
}