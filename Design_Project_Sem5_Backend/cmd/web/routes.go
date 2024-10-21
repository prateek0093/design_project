package main

import (
	"DesignProjectBackend/handlers"
	"fmt"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/cors"
	"net/http"
)

func routes() http.Handler {
	mux := chi.NewRouter()
	mux.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5175", "http://localhost:5175/signup", "*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token", "application/json"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))
	mux.Post("/", func(w http.ResponseWriter, r *http.Request) {
		_, err := fmt.Fprintf(w, "Hello World")
		if err != nil {
			return
		}
	})
	mux.Post("/login", handlers.Repo.Login)
	mux.Post("/signUp", handlers.Repo.SignUp)
	mux.Post("/otpVerification", handlers.Repo.OtpVerification)
	return mux
}
