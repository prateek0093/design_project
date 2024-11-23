package database

import (
	"DesignProjectBackend/models/RecievedData"
	"DesignProjectBackend/models/SentData"
)

type DatabaseRepo interface {
	SignUpUser(user RecievedData.User) error
	InsertOtp(otp int, email string) error
	VerifyOTP(data RecievedData.OtpDetails) (bool, error)
	MarkUserVerified(data RecievedData.OtpDetails) error
	DeleteOTP(data RecievedData.OtpDetails) error
	Login(email, password string) (string, bool, error)
	GetAllCoursesForStudent(name string) ([]SentData.CourseData, error)
	Get3RecentAssignments(name string) ([]SentData.AssignmentData, error)
	GetRoleFromUserName(name string) (string, error)
	GetAllCoursesForAuthor(name string) ([]SentData.CourseData, error)
	AddCourse(username, courseCode, courseName, batchYear, branch string) error
	GetAssignmentsForCourse(username, courseCode string) ([]SentData.AssignmentData, error)
	AddAssignment(assignment RecievedData.Assignment) error
	GetAllQuestionsForAssignment(assignmentId, username string) ([]SentData.StudentAssignmentDetails, error)
	GetQuestionTextFromId(questionId string) (string, error)
	GetTestCasesFromQuestionId(questionId string) ([]byte, error)
	AddSubmission(username, questionId string, codeFile []byte) error
	SubmitQuestion(marks int, username, questionId string) error
	GetCourseCodeAndAssignmentIdFromQuestionId(questionId string) (string, string, error)
	SubmitAssignment(assignmentId string, username string) error
	GetMarksFromQuestionId(questionId string) (int, error)
	GetSubmissionDetailsForProfessor(assignmentId string) ([]SentData.SubmissionData, error)
	GetQuestionAttemptedStatus(username, questionId string) (bool, error)
	GetAllAssignmentsForStudents(username string) ([]SentData.AssignmentData, error)
	GetAllSubmittedAssignmentsForStudents(username string) ([]SentData.SubmittedAssignmentData, error)
}
