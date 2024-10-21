package RecievedData

type User struct {
	Name     string `json:"username"`
	Password string `json:"password"`
	Email    string `json:"email"`
}
type OtpDetails struct {
	Email   string `json:"email"`
	OtpCode int    `json:"otp"`
}
