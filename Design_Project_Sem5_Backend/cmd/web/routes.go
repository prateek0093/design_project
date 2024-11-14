package main

import (
	"DesignProjectBackend/handlers"
	"fmt"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	"net/http"
	"os"
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
	mux.Handle("/dist/*", http.StripPrefix("/dist", http.FileServer(http.Dir("./dist"))))
	mux.Get("/*", func(w http.ResponseWriter, r *http.Request) {
		// Only serve index.html if no file is found
		file := fmt.Sprintf("./dist%s", r.URL.Path)
		if _, err := os.Stat(file); os.IsNotExist(err) {
			// If the file does not exist, serve index.html as a fallback
			http.ServeFile(w, r, "./dist/index.html")
		} else {
			// If the file exists, serve it directly (this prevents fallback)
			http.ServeFile(w, r, file)
		}
	})
	mux.Post("/login", handlers.Repo.Login)
	mux.Post("/signUp", handlers.Repo.SignUp)
	mux.Post("/otpVerification", handlers.Repo.OtpVerification)
	mux.Route("/verified", func(mux chi.Router) {
		mux.Use(AuthMiddleware)
		mux.Route("/author", func(mux chi.Router) {
			mux.With(RoleMiddleware("author")).Get("/dashboard", handlers.Repo.AuthorDashBoard)
			mux.With(RoleMiddleware("author")).Post("/addCourse", handlers.Repo.AddCourse)
			mux.With(RoleMiddleware("author")).Get("/courseAssignments/{id}", handlers.Repo.AllAssignment)
			mux.With(RoleMiddleware("author")).Post("/addAssignment/{id}", handlers.Repo.AddAssignment)
		})
		mux.Route("/student", func(mux chi.Router) {
			mux.With(RoleMiddleware("student")).Get("/dashboard", handlers.Repo.StudentDashboard)
		})
	})

	return mux
}
