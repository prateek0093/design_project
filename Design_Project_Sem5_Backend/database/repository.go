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
	GetAllCoursesForStudent(email string) ([]SentData.CourseData, error)
	Get3RecentAssignments(email string) ([]SentData.AssignmentData, error)
	GetRoleFromEmail(email string) (string, error)
	GetAllCoursesForAuthor(email string) ([]SentData.CourseData, error)
	AddCourse(email, courseCode, courseName, batchYear, branch string) error
	GetAssignmentsForCourse(email, courseCode string) ([]SentData.AssignmentData, error)
	AddAssignment(assignment RecievedData.Assignment) error
	GetAllQuestionsForAssignment(assignmentId, email string) ([]SentData.StudentAssignmentDetails, error)
	GetQuestionTextFromId(questionId string) (string, error)
	GetTestCasesFromQuestionId(questionId string) ([]byte, error)
	AddSubmission(email, questionId string, codeFile []byte) error
	SubmitQuestion(marks int, email, questionId string) error
	GetCourseCodeAndAssignmentIdFromQuestionId(questionId string) (string, string, []string, error)
	SubmitAssignment(assignmentId string, email string) error
	GetMarksFromQuestionId(questionId string) (int, error)
	GetSubmissionDetailsForProfessor(assignmentId string) ([]SentData.SubmissionData, error)
	GetQuestionAttemptedStatus(email, questionId string) (bool, error)
	GetAllAssignmentsForStudents(email string) ([]SentData.AssignmentData, error)
	GetAllSubmittedAssignmentsForStudents(email string) ([]SentData.SubmittedAssignmentData, error)
	GetSubmissionDetailsForProfessorToDownload(assignmentId string) ([]SentData.DataForDownload, error)
	CheckIfAssignmentIsSubmitted(assignmentId, email string) (bool, error)
}
