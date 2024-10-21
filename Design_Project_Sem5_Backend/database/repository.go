package database

import "DesignProjectBackend/models/RecievedData"

type DatabaseRepo interface {
	SignUpUser(user RecievedData.User) error
	InsertOtp(otp int, email string) error
	VerifyOTP(data RecievedData.OtpDetails) (bool, error)
	MarkUserVerified(data RecievedData.OtpDetails) error
	DeleteOTP(data RecievedData.OtpDetails) error
	Login(email, password string) (string, bool, error)
}
