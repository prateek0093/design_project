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
	CourseId       string    `json:"courseId"`
	AssignmentName string    `json:"assignmentName"`
	StartTime      time.Time `json:"startTime"`
}
