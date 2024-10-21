package handlers

import (
	"DesignProjectBackend/database"
	"DesignProjectBackend/database/dbrepo"
	"DesignProjectBackend/drivers"
	"DesignProjectBackend/models/RecievedData"
	"crypto/rand"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/joho/godotenv"
	"math/big"
	"net/http"
	"net/smtp"
	"os"
	"strconv"
)

var Repo *Repository

type Repository struct {
	DB database.DatabaseRepo
}

func NewRepo(db *drivers.DB) *Repository {
	return &Repository{
		DB: dbrepo.NewPostgresRepo(db.SQL),
	}
}

func NewHandler(r *Repository) {
	Repo = r
}

func (m *Repository) Login(w http.ResponseWriter, r *http.Request) {
	var user RecievedData.User
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, "Error parsing signup data", http.StatusBadRequest)
		fmt.Println("Error parsing signup data:", err)
		return
	}
	fmt.Println(user)
	response := make(map[string]interface{})

	username, verified, err := m.DB.Login(user.Email, user.Password)
	switch {
	case errors.Is(err, errors.New("user not found")):
		fmt.Println("User not found")
		http.Error(w, "Invalid username", http.StatusUnauthorized)
		return
	case errors.Is(err, errors.New("invalid password")):
		fmt.Println("Invalid password")
		http.Error(w, "Invalid password", http.StatusUnauthorized)
		return
	case err != nil:
		fmt.Println("Error logging in user:", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	if !verified {
		fmt.Println("User not verified")
		http.Error(w, "User not verified", http.StatusUnauthorized)
		return
	}

	// Successful login
	response["success"] = true
	response["username"] = username
	w.WriteHeader(http.StatusOK)
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		http.Error(w, "Error encoding response", http.StatusInternalServerError)
		fmt.Println("Error encoding response:", err)
	}
}

func (m *Repository) SignUp(w http.ResponseWriter, r *http.Request) {
	if err := godotenv.Load(); err != nil {
		fmt.Println("Error loading environment variables:", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	var user RecievedData.User
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Println("Error parsing signup data", err)
		return
	}
	fmt.Println(user)
	otp, err := generateOTP()
	if err != nil {
		fmt.Println("Error generating OTP", err)
		return
	}
	fmt.Println(otp)

	// SEnding Email

	auth := smtp.PlainAuth("", os.Getenv("FROM_EMAIL"),
		os.Getenv("FROM_EMAIL_PASSWORD"), os.Getenv("FROM_EMAIL_SMTP"))
	message := "Subject: " + "OTP Testing" + "\n" + strconv.Itoa(otp)
	err = smtp.SendMail(
		os.Getenv("SMTP_ADDR"),
		auth,
		os.Getenv("FROM_EMAIL"),
		[]string{user.Email},
		[]byte(message),
	)
	if err != nil {
		fmt.Println("Error sending email", err)
		return
	}
	err = m.DB.InsertOtp(otp, user.Email)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println("Error inserting otp to db", err)
		return
	}
	err = m.DB.SignUpUser(user)
	if err != nil {
		fmt.Println("Error adding user to db", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte("OTP SENT SUCCESSFULLY"))
}

func generateOTP() (int, error) {
	// Define the range for a 6-digit number (1000 to 9999 inclusive)
	rangeMin := 100000
	rangeMax := 999999

	// Generate a random number within the specified range
	nBig, err := rand.Int(rand.Reader, big.NewInt(int64(rangeMax-rangeMin+1)))
	if err != nil {
		return 0, err
	}

	// Convert to int and add the minimum value to ensure it's within range
	otp := int(nBig.Int64()) + rangeMin

	return otp, nil
}

func (m *Repository) OtpVerification(w http.ResponseWriter, r *http.Request) {
	fmt.Println("OTP AAYA")
	var data RecievedData.OtpDetails
	err := json.NewDecoder(r.Body).Decode(&data)
	if err != nil {
		fmt.Println("Error parsing data", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}
	fmt.Println(data)
	verified, err := m.DB.VerifyOTP(data)
	if err != nil {
		if errors.Is(err, errors.New("invalid otp code")) {
			_, _ = w.Write([]byte("invalid otp code"))
		} else if errors.Is(err, errors.New("otp expired")) {
			_, _ = w.Write([]byte("otp expired"))
		}
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println("Error verifying OTP", err)
		return
	}
	if verified {
		// update user status to verified
		err = m.DB.MarkUserVerified(data)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Println("Error Marking user Verified", err)
			return
		}
		// delete otp from db
		err = m.DB.DeleteOTP(data)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Println("Error deleting OTP", err)
			return
		}
	}
	response := map[string]interface{}{
		"success": true,
	}
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		fmt.Println("Error in encoding response", err)
		return
	}
}
