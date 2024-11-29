package SentData

import "time"

type CourseData struct {
	CourseName string `json:"courseName"`
	CourseCode string `json:"courseCode"`
	CourseId   string `json:"courseId"`
	AuthorName string `json:"authorName"`
}
type AssignmentData struct {
	CourseName     string    `json:"courseName"`
	CourseCode     string    `json:"courseCode"`
	AssignmentName string    `json:"assignmentName"`
	AssignmentId   string    `json:"assignmentId"`
	StartTime      time.Time `json:"startTime"`
	EndTime        time.Time `json:"endTime"`
	Submitted      bool      `json:"isSubmitted"`
}
type StudentAssignmentDetails struct {
	AssignmentName string `json:"assignmentName"`
	QuestionStatus bool   `json:"questionStatus"`
	QuestionId     string `json:"questionId"`
	//QuestionText   string `json:"questionText"`
	MaxScore int `json:"maxScore"`
	//CodeFile      []byte    `json:"cfile"` // Stores the .c file content
	//TestCasesFile []byte    `json:"csv"` // Stores the .csv file content
	CreatedAt time.Time `json:"createdAt"`
}
type SubmissionData struct {
	RollNumber     string              `json:"rollNumber"`
	Username       string              `json:"username"`
	Marks          int                 `json:"marks"`
	SubmissionTime time.Time           `json:"submissionTime"`
	SubmittedData  []SubmittedQuestion `json:"submittedData"`
}
type SubmittedQuestion struct {
	QuestionText  string `json:"questionText"`
	SubmittedCode string `json:"submittedQuestions"`
}

type SubmittedAssignmentData struct {
	CourseName     string    `json:"courseName"`
	CourseCode     string    `json:"courseCode"`
	AssignmentName string    `json:"assignmentName"`
	AssignmentId   string    `json:"assignmentId"`
	StartTime      time.Time `json:"startTime"`
	EndTime        time.Time `json:"endTime"`
	Submitted      bool      `json:"isSubmitted"`
	GradedTime     time.Time `json:"gradedTime"`
	ScoredMarks    int       `json:"scoredMarks"`
}
type DataForDownload struct {
	RollNumber     string    `json:"rollNumber"`
	Username       string    `json:"username"`
	Marks          int       `json:"marks"`
	SubmissionTime time.Time `json:"submissionTime"`
	AssignmentName string    `json:"assignmentName"`
}
