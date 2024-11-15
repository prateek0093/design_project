package RecievedData

import "time"

type User struct {
	Name     string `json:"username"`
	Password string `json:"password"`
	Email    string `json:"email"`
}
type OtpDetails struct {
	Email   string `json:"email"`
	OtpCode int    `json:"otp"`
}
type Assignment struct {
	AssignmentName string     `json:"assignmentName"`
	CourseCode     string     `json:"courseCode"`
	StartTime      time.Time  `json:"startTime"`
	EndTime        time.Time  `json:"endTime"`
	Questions      []Question `json:"questions"` // Nested questions
	CreatedAt      time.Time  `json:"createdAt"`
}
type Question struct {
	//AssignmentName string    `json:"assignmentName"`
	QuestionText  string    `json:"ques"`
	MaxScore      int       `json:"maxScore"`
	CodeFile      []byte    `json:"cfile"` // Stores the .c file content
	TestCasesFile []byte    `json:"csv"`   // Stores the .csv file content
	CreatedAt     time.Time `json:"createdAt"`
}
