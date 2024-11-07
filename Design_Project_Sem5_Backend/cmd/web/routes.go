package main

import (
	"DesignProjectBackend/handlers"
	"fmt"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"net/http"
)

func routes() http.Handler {
	mux := chi.NewRouter()
	mux.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{"http://localhost:5174", "http:localhost:8080"}, // Specify exact origins, no "*"
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true, // Required for cookies
		MaxAge:           300,
	}))
	mux.Use(middleware.Recoverer)
	mux.Handle("/*", http.StripPrefix("/", http.FileServer(http.Dir("./dist"))))
	mux.Get("/*", func(w http.ResponseWriter, r *http.Request) {
		http.ServeFile(w, r, "./dist/index.html")
	})
	mux.Post("/login", handlers.Repo.Login)
	mux.Post("/signUp", handlers.Repo.SignUp)
	mux.Post("/otpVerification", handlers.Repo.OtpVerification)
	mux.Route("/verified", func(mux chi.Router) {
		mux.Use(AuthMiddleware)
		mux.Route("/author", func(mux chi.Router) {
			mux.With(RoleMiddleware("author")).Post("/dashboard", func(w http.ResponseWriter, r *http.Request) {
				_, err := fmt.Fprintf(w, "Admin dashBoard")
				if err != nil {
					return
				}
			})
		})
		mux.Route("/student", func(mux chi.Router) {
			mux.With(RoleMiddleware("student")).Get("/dashboard", handlers.Repo.StudentDashboard)
		})
	})

	return mux
}
