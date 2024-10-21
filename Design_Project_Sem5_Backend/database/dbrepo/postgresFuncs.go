package dbrepo

import (
	"DesignProjectBackend/models/RecievedData"
	"context"
	"database/sql"
	"errors"
	"fmt"
	"golang.org/x/crypto/bcrypt"
	"time"
)

func (m *PostgresRepo) SignUpUser(user RecievedData.User) error {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()
	query := `INSERT INTO users(username, email, password,role,verified) VALUES ($1, $2, $3,$4,$5)`
	hashedPass, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		fmt.Println("Error hashing password", err)
		return err
	}
	_, err = m.DB.ExecContext(ctx, query, user.Name, user.Email, hashedPass, "student", false)
	if err != nil {
		fmt.Println("Error signing Up user", err)
		return err
	}
	return nil
}

func (m *PostgresRepo) InsertOtp(otp int, email string) error {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()
	query := `INSERT INTO user_otps(email,otp,expires_at) VALUES ($1, $2, $3)`
	_, err := m.DB.ExecContext(ctx, query, email, otp, time.Now().Add((time.Minute)*5))
	if err != nil {
		fmt.Println("Error inserting Otp", err)
		return err
	}
	return nil
}

func (m *PostgresRepo) VerifyOTP(data RecievedData.OtpDetails) (bool, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()
	query := `SELECT otp,expires_at FROM user_otps WHERE email =$1`
	row := m.DB.QueryRowContext(ctx, query, data.Email)
	if row == nil {
		return false, errors.New("email not found")
	}
	var otp int
	var expiresAt time.Time
	err := row.Scan(&otp, &expiresAt)
	if err != nil {
		return false, err
	}
	if otp != data.OtpCode {
		return false, errors.New("invalid otp code")
	} else if time.Now().After(expiresAt) {
		return false, errors.New("otp expired")
	} else {
		return true, nil
	}
}
func (m *PostgresRepo) MarkUserVerified(data RecievedData.OtpDetails) error {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()
	query := `UPDATE users SET verified=true WHERE email=$1`
	_, err := m.DB.ExecContext(ctx, query, data.Email)
	if err != nil {
		return err
	}
	return nil
}

func (m *PostgresRepo) DeleteOTP(data RecievedData.OtpDetails) error {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()
	query := `DELETE FROM user_otps WHERE email=$1`
	_, err := m.DB.ExecContext(ctx, query, data.Email)
	if err != nil {
		return err
	}
	return nil
}

func (m *PostgresRepo) Login(email, password string) (string, bool, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()

	var userName, pass string
	var verification bool
	query := `SELECT username, password, verified FROM users WHERE email = $1`

	// Use QueryRowContext for a single row result
	row := m.DB.QueryRowContext(ctx, query, email)
	err := row.Scan(&userName, &pass, &verification)
	if err != nil {
		if err == sql.ErrNoRows {
			// No user found with the provided email
			return "", false, errors.New("user not found")
		}
		fmt.Println("Error scanning user data:", err)
		return "", false, err
	}

	// Compare the provided password with the stored hash
	err = bcrypt.CompareHashAndPassword([]byte(pass), []byte(password))
	if err != nil {
		fmt.Println("Invalid password:", err)
		return "", false, errors.New("invalid password")
	}

	return userName, verification, nil
}
