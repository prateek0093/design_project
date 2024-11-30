package main

import (
	"context"
	"errors"
	"fmt"
	"github.com/golang-jwt/jwt/v5"
	"net/http"
	"os"
)

// Claims struct defines the structure of the JWT claims
type Claims struct {
	Email    string `json:"email"`
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

// extractTokenFromCookie extracts and validates the JWT token from the "accessToken" cookie
func extractTokenFromCookie(r *http.Request) (*Claims, error) {
	//fmt.Println(r)
	cookie, err := r.Cookie("accessToken")
	if errors.Is(err, http.ErrNoCookie) {
		fmt.Println("No cookie found:", err)
		return nil, errors.New("no cookie found")
	} else if err != nil {
		fmt.Println("Error checking cookie:", err)
		return nil, err
	}

	// Parse and validate JWT Token
	token, err := jwt.ParseWithClaims(cookie.Value, &Claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(os.Getenv("JWT_KEY")), nil
	})

	if err != nil || !token.Valid {
		return nil, fmt.Errorf("invalid token: %v", err)
	}

	claims, ok := token.Claims.(*Claims)
	if !ok {
		return nil, fmt.Errorf("could not parse claims")
	}

	return claims, nil
}

// AuthMiddleware checks if the user is authenticated and sets claims in the request context
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		claims, err := extractTokenFromCookie(r)
		if err != nil {
			http.Error(w, http.StatusText(http.StatusUnauthorized), http.StatusUnauthorized)
			return
		}

		ctx := context.WithValue(r.Context(), "username", claims.Username)
		ctx = context.WithValue(ctx, "email", claims.Email)
		ctx = context.WithValue(ctx, "role", claims.Role)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// RoleMiddleware checks if the user has a specific role before allowing access
func RoleMiddleware(requiredRole string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			role, ok := r.Context().Value("role").(string)
			if !ok || role != requiredRole {
				http.Error(w, "Forbidden: You don't have the necessary role", http.StatusForbidden)
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}
