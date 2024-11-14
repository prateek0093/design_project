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
}
