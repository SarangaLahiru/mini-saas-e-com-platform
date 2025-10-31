package main

import (
	"electronics-store/internal/api"
	"electronics-store/internal/config"
	"electronics-store/internal/database"
	"log"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatal("Failed to load config:", err)
	}

	// Initialize database
	db, err := database.NewConnection(cfg.Database)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Initialize and start server
	server := api.NewServer(cfg, db)
	
	log.Printf("Starting server on port %s", cfg.Server.Port)
	if err := server.Start(); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}
