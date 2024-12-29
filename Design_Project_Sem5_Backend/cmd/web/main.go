package main

import (
	"DesignProjectBackend/drivers"
	"DesignProjectBackend/handlers"
	"database/sql"
	"fmt"
	"github.com/joho/godotenv"
	"net/http"
	"os"
)

func main() {
	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		fmt.Println("Warning: .env file not found, using defaults or environment variables")
	}

	// Get environment variables with fallbacks
	dbHost := getEnv("DB_HOST", "localhost")
	dbPort := getEnv("DB_PORT", "5432")
	dbName := getEnv("DB_NAME", "DesignProject")
	dbUser := getEnv("DB_USER", "yash")
	dbPassword := getEnv("DB_PASSWORD", "123")
	serverHost := getEnv("SERVER_HOST", "0.0.0.0")
	serverPort := getEnv("SERVER_PORT", ":8080")

	fmt.Println("Connecting to Database")
	connectionString := fmt.Sprintf(
		"host=%s port=%s dbname=%s user=%s password=%s connect_timeout=10",
		dbHost, dbPort, dbName, dbUser, dbPassword,
	)

	db, err := drivers.ConnectSQL(connectionString)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer func(SQL *sql.DB) {
		err := SQL.Close()
		if err != nil {
			fmt.Println("Error closing SQL", err)
			return
		}
	}(db.SQL)

	err = db.SQL.Ping()
	if err != nil {
		fmt.Println("Error in Pinging database", err)
		return
	}
	fmt.Println("Connected to Database in main.go")

	Repo := handlers.NewRepo(db)
	handlers.NewHandler(Repo)

	portNumber := fmt.Sprintf("%s:%s", serverHost, serverPort)
	fmt.Printf("Server started on %s\n", portNumber)

	srv := http.Server{
		Addr:    portNumber,
		Handler: routes(),
	}

	err = srv.ListenAndServe()
	if err != nil {
		fmt.Println(err)
		return
	}
}

// Helper function to get environment variables with fallback
func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}
