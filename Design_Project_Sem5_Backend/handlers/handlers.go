package handlers

import (
	"DesignProjectBackend/database"
	"DesignProjectBackend/database/dbrepo"
	"DesignProjectBackend/drivers"
	helpers "DesignProjectBackend/helpers/judge0Funcs"
	"DesignProjectBackend/models/RecievedData"
	"DesignProjectBackend/models/SentData"
	"bytes"
	"crypto/rand"
	"encoding/csv"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
	"io"
	"math"
	"math/big"
	"net/http"
	"net/smtp"
	"os"
	"strconv"
	"strings"
	"sync"
	"time"
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

type Claims struct {
	Username string `json:"username"`
	Role     string `json:"role"`
	jwt.RegisteredClaims
}

func (m *Repository) Login(w http.ResponseWriter, r *http.Request) {
	if err := godotenv.Load(); err != nil {
		fmt.Println("Error loading environment variables:", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	var user RecievedData.User
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, "Error parsing login data", http.StatusBadRequest)
		fmt.Println("Error parsing login data:", err)
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
	role, err := m.DB.GetRoleFromUserName(username)
	if err != nil {
		fmt.Println("Error getting role from user:", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	if role != "student" {
		fmt.Println("author tried to access")
		http.Error(w, "Invalid role", http.StatusUnauthorized)
		return
	}
	claims := &Claims{
		Username: username,
		Role:     role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
		},
	}
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5174") // Replace with your frontend URL
	w.Header().Set("Access-Control-Allow-Credentials", "true")
	w.Header().Set("Content-Type", "application/json")
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(os.Getenv("JWT_KEY")))
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode("Error generating token")
		fmt.Println("Error in signing token", err)
		return
	}
	http.SetCookie(w, &http.Cookie{
		Name:     "accessToken",
		Value:    tokenString,
		Path:     "/",
		Expires:  time.Now().Add(24 * time.Hour),
		HttpOnly: false,
		Secure:   true,
		SameSite: http.SameSiteNoneMode,
	})
	// Successful login
	response["success"] = true
	response["username"] = username
	response["tokenString"] = tokenString
	w.WriteHeader(http.StatusOK)
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		http.Error(w, "Error encoding response", http.StatusInternalServerError)
		fmt.Println("Error encoding response:", err)
	}
}

func (m *Repository) AuthorLogin(w http.ResponseWriter, r *http.Request) {
	if err := godotenv.Load(); err != nil {
		fmt.Println("Error loading environment variables:", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	var user RecievedData.User
	err := json.NewDecoder(r.Body).Decode(&user)
	if err != nil {
		http.Error(w, "Error parsing login data", http.StatusBadRequest)
		fmt.Println("Error parsing login data:", err)
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
	role, err := m.DB.GetRoleFromUserName(username)
	if err != nil {
		fmt.Println("Error getting role:", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	fmt.Println(role)
	if role != "author" {
		fmt.Println("Student tried to access")
		http.Error(w, "Invalid role", http.StatusUnauthorized)
		return
	}
	claims := &Claims{
		Username: username,
		Role:     role,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
		},
	}
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5174") // Replace with your frontend URL
	w.Header().Set("Access-Control-Allow-Credentials", "true")
	w.Header().Set("Content-Type", "application/json")
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(os.Getenv("JWT_KEY")))
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		_ = json.NewEncoder(w).Encode("Error generating token")
		fmt.Println("Error in signing token", err)
		return
	}
	http.SetCookie(w, &http.Cookie{
		Name:     "accessToken",
		Value:    tokenString,
		Path:     "/",
		Expires:  time.Now().Add(24 * time.Hour),
		HttpOnly: false,
		Secure:   true,
		SameSite: http.SameSiteNoneMode,
	})
	// Successful login
	response["success"] = true
	response["username"] = username
	response["tokenString"] = tokenString
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
	err = m.DB.SignUpUser(user)
	if err != nil {
		fmt.Println("Error adding user to db", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	err = m.DB.InsertOtp(otp, user.Email)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println("Error inserting otp to db", err)
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

func (m *Repository) Logout(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Access-Control-Allow-Origin", "http://localhost:5174")
	w.Header().Set("Access-Control-Allow-Credentials", "true")
	w.Header().Set("Content-Type", "application/json")

	// Clear the access token cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "accessToken",
		Value:    "",
		Path:     "/",
		Expires:  time.Unix(0, 0),
		HttpOnly: false,
		Secure:   true,
		SameSite: http.SameSiteNoneMode,
	})

	response := make(map[string]interface{})
	response["success"] = true
	response["message"] = "Logged out successfully"

	w.WriteHeader(http.StatusOK)
	err := json.NewEncoder(w).Encode(response)
	if err != nil {
		http.Error(w, "Error encoding response", http.StatusInternalServerError)
		fmt.Println("Error encoding response:", err)
	}
}
func (m *Repository) StudentDashboard(w http.ResponseWriter, r *http.Request) {
	username := r.Context().Value("username").(string)
	fmt.Println(username)
	role := r.Context().Value("role").(string)
	fmt.Println(role)
	allCourses, err := m.DB.GetAllCoursesForStudent(username)
	if errors.Is(err, errors.New("no courses enrolled by student")) {
		fmt.Println("No courses enrolled by student", err)
		http.Error(w, "No courses enrolled by student", http.StatusExpectationFailed)
		return
	} else if err != nil {
		http.Error(w, "Error getting all courses", http.StatusInternalServerError)
		fmt.Println("Error getting all courses:", err)
		return
	}

	recentAssignments, err := m.DB.Get3RecentAssignments(username)
	if errors.Is(err, errors.New("no tasks Assigned")) {
		fmt.Println("No tasks Assigned", err)
		http.Error(w, "No tasks Assigned", http.StatusExpectationFailed)
		return
	} else if err != nil {
		fmt.Println("Error getting recent Assignments:", err)
		return
	}
	fmt.Println("ac", allCourses)
	fmt.Println("ra", recentAssignments)
	response := map[string]interface{}{
		"username":        username,
		"success":         true,
		"enrolledCourses": allCourses,
		"recentTasks":     recentAssignments,
	}
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		fmt.Println("Error in encoding response", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
}

func (m *Repository) AuthorDashBoard(w http.ResponseWriter, r *http.Request) {
	name := r.Context().Value("username").(string)
	fmt.Println(name)
	allCourses, err := m.DB.GetAllCoursesForAuthor(name)
	if errors.Is(err, errors.New("no courses enrolled by author")) {
		fmt.Println("No courses enrolled by author", err)
		http.Error(w, "No courses enrolled by author", http.StatusExpectationFailed)
		return
	} else if err != nil {
		fmt.Println("Error getting courses", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	response := map[string]interface{}{
		"success": true,
		"courses": allCourses,
	}
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		fmt.Println("Error in encoding response", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
}

func (m *Repository) AddCourse(w http.ResponseWriter, r *http.Request) {
	username := r.Context().Value("username").(string)
	type NewCourse struct {
		CourseName string `json:"courseName"`
		CourseCode string `json:"courseCode"`
		BatchYear  string `json:"batchYear"`
		Branch     string `json:"branch"`
	}
	var newCourse NewCourse
	err := json.NewDecoder(r.Body).Decode(&newCourse)
	if err != nil {
		http.Error(w, "Invalid request payload", http.StatusBadRequest)
		fmt.Println("Error parsing data", err)
		return
	}
	fmt.Println("Decoded course:", newCourse)

	err = m.DB.AddCourse(username, newCourse.CourseCode, newCourse.CourseName, newCourse.BatchYear, newCourse.Branch)
	if err != nil {
		http.Error(w, "Failed to add course", http.StatusInternalServerError)
		fmt.Println("Error adding course", err)
		return
	}
	response := map[string]interface{}{
		"success": true,
	}
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		fmt.Println("Error in encoding response", err)
		return
	}
	//w.WriteHeader(http.StatusCreated)
	//_, _ = w.Write([]byte("Course added successfully"))
}

func (m *Repository) AllAssignmentForCourse(w http.ResponseWriter, r *http.Request) {
	username := r.Context().Value("username").(string)
	courseCode := chi.URLParam(r, "id")
	fmt.Println("CourseCode:", courseCode)
	assignments, err := m.DB.GetAssignmentsForCourse(username, courseCode)
	if errors.Is(err, errors.New("no assignments assigned")) {
		fmt.Println(err)
		http.Error(w, "no assignments assigned", http.StatusBadRequest)
		w.WriteHeader(http.StatusBadRequest)
		return
	} else if err != nil {
		fmt.Println("Error getting assignments from db", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	fmt.Println(assignments)
	response := map[string]interface{}{
		"success":     true,
		"assignments": assignments,
	}
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		fmt.Println("Error encoding json")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
}

func (m *Repository) AddAssignment(w http.ResponseWriter, r *http.Request) {
	courseCode := chi.URLParam(r, "id")

	// Parse the form data (including files)
	err := r.ParseMultipartForm(10 << 20) // 10 MB limit
	if err != nil {
		http.Error(w, "Unable to parse form data", http.StatusBadRequest)
		fmt.Println(err)
		return
	}

	// Create a new assignment object
	var newAssignment RecievedData.Assignment
	newAssignment.CourseCode = courseCode
	newAssignment.AssignmentName = r.FormValue("assignmentName")
	newAssignment.StartTime, _ = time.Parse("2006-01-02T15:04", r.FormValue("startTime"))
	newAssignment.EndTime, _ = time.Parse("2006-01-02T15:04", r.FormValue("endTime"))
	newAssignment.CreatedAt = time.Now()

	// Extract questions and their files from the form data
	var questions []RecievedData.Question
	length, err := strconv.Atoi(r.FormValue("length"))
	if err != nil {
		fmt.Println("error parsing length", err)
		return
	}
	// Assuming the form contains multiple questions, we need to loop through them
	for i := 0; i < length; i++ {
		// Get the question text and the file content for each question
		quesText := r.FormValue(fmt.Sprintf("questions[%d].ques", i))
		quesMaxMarks := r.FormValue(fmt.Sprintf("questions[%d].maximumMarks", i))

		// Get the files associated with the question
		cfile, cfileExists := r.MultipartForm.File[fmt.Sprintf("questions[%d].cfile", i)]
		csv, csvExists := r.MultipartForm.File[fmt.Sprintf("questions[%d].csv", i)]

		// Ensure both files are present in the form
		if !cfileExists || len(cfile) == 0 {
			http.Error(w, fmt.Sprintf("Code file for question %d is missing", i), http.StatusBadRequest)
			return
		}
		if !csvExists || len(csv) == 0 {
			http.Error(w, fmt.Sprintf("Test cases file for question %d is missing", i), http.StatusBadRequest)
			return
		}

		// Read the file content directly from the multipart form
		codeFile, err := cfile[0].Open()
		if err != nil {
			http.Error(w, "Error opening code file", http.StatusInternalServerError)
			fmt.Println(err)
			return
		}
		codeFileContent, err := io.ReadAll(codeFile)
		if err != nil {
			http.Error(w, "Error reading code file", http.StatusInternalServerError)
			fmt.Println(err)
			return
		}

		testCasesFile, err := csv[0].Open()
		if err != nil {
			http.Error(w, "Error opening test cases file", http.StatusInternalServerError)
			fmt.Println(err)
			return
		}
		testCasesFileContent, err := io.ReadAll(testCasesFile)
		if err != nil {
			http.Error(w, "Error reading test cases file", http.StatusInternalServerError)
			fmt.Println(err)
			return
		}
		maxMarks, err := strconv.Atoi(quesMaxMarks)
		if err != nil {
			http.Error(w, "Error parsing max marks", http.StatusInternalServerError)
			fmt.Println("error parsing Max Marks", err)
			return
		}

		// Create a question struct and append it to the questions slice
		questions = append(questions, RecievedData.Question{
			QuestionText:  quesText,
			MaxScore:      maxMarks,
			CodeFile:      codeFileContent,
			TestCasesFile: testCasesFileContent,
			CreatedAt:     time.Now(),
		})
	}

	// Assign the questions to the new assignment
	newAssignment.Questions = questions

	if err := godotenv.Load(); err != nil {
		fmt.Println("Error loading environment variables:", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	// Checking code for correctness against all test cases before adding to db
	for i := 0; i < len(newAssignment.Questions); i++ {
		question := newAssignment.Questions[i]
		_, pass, errString := helpers.ValidateCodeAgainstTestCases(string(question.CodeFile), question.TestCasesFile, os.Getenv("JUDGE0_URL"))
		if !pass {
			fmt.Println("Error in validating question:", i+1, errString)
			http.Error(w, "Failed to add assignment", http.StatusBadRequest)
			response := map[string]interface{}{
				"success": false,
				"error":   errString,
			}
			err = json.NewEncoder(w).Encode(response)
			if err != nil {
				fmt.Println("Error encoding json", err)
				w.WriteHeader(http.StatusInternalServerError)
				return
			}
			w.WriteHeader(http.StatusBadRequest)
			return
		}
	}
	// If all testcases pass add to db
	err = m.DB.AddAssignment(newAssignment)
	if err != nil {
		http.Error(w, "Failed to add assignment", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}
	//fmt.Println("NewAssignment", newAssignment)
	fmt.Println("newAssignment name:", newAssignment.AssignmentName, "newAssignment start time:", newAssignment.StartTime, "newAssignment end time:", newAssignment.EndTime)
	//for i := 0; i < len(newAssignment.Questions); i++ {
	//	fmt.Println("newAssignment Question name:", newAssignment.Questions[0].QuestionText)
	//	fmt.Println("newAssignment Question code:", string(newAssignment.Questions[0].CodeFile))
	//	fmt.Println("newAssignment Question csv", string(newAssignment.Questions[0].TestCasesFile))
	//}
	//fmt.Println("courseCode", courseCode)
	response := map[string]interface{}{
		"success": false,
	}
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		fmt.Println("Error encoding json")
		return
	}
	// For now, let's just return a success message
	//w.WriteHeader(http.StatusOK)
	//w.Write([]byte("Assignment added successfully"))
}

func (m *Repository) AllQuestionsForAssignment(w http.ResponseWriter, r *http.Request) {
	courseCode := chi.URLParam(r, "courseId")
	assignmentId := chi.URLParam(r, "assignmentId")
	username := r.Context().Value("username").(string)
	fmt.Println("assignmentId:", assignmentId)
	fmt.Println("courseCode:", courseCode)
	questions, err := m.DB.GetAllQuestionsForAssignment(assignmentId, username)
	if err != nil {
		fmt.Println(err)
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		w.WriteHeader(http.StatusInternalServerError)
	}
	fmt.Println("questions:", questions)
	response := map[string]interface{}{
		"success":   true,
		"questions": questions,
	}
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		fmt.Println("Error encoding json")
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
}

func (m *Repository) StudentSubmission(w http.ResponseWriter, r *http.Request) {
	if err := godotenv.Load(); err != nil {
		fmt.Println("Error loading environment variables:", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	username := r.Context().Value("username").(string)
	//fmt.Println("I was here")
	questionId := chi.URLParam(r, "questionId")
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		fmt.Println("Error in parsing multipart form:", err)
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		return
	}
	cfile, cfileExists := r.MultipartForm.File["codeFile"]
	if !cfileExists || len(cfile) == 0 {
		http.Error(w, fmt.Sprintf("Code file for question is missing"), http.StatusBadRequest)
		return
	}
	codeFile, err := cfile[0].Open()
	if err != nil {
		http.Error(w, "Error opening code file", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}
	codeFileContent, err := io.ReadAll(codeFile)
	if err != nil {
		http.Error(w, "Error reading code file", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}
	//fmt.Println("cFile:", string(codeFileContent))
	testCasesFile, err := m.DB.GetTestCasesFromQuestionId(questionId)
	if err != nil {
		fmt.Println(err)
		return
	}
	maxMarks, err := m.DB.GetMarksFromQuestionId(questionId)
	if err != nil {
		fmt.Println(err)
		return
	}
	reader := csv.NewReader(bytes.NewReader(testCasesFile))
	testCases, err := reader.ReadAll()
	//fmt.Println("testCasesFile:", string(testCasesFile))
	totalTests := len(testCases) - 1
	passedCasesCount, pass, errString := helpers.ValidateCodeAgainstTestCases(string(codeFileContent), testCasesFile, os.Getenv("JUDGE0_URL"))
	err = m.DB.AddSubmission(username, questionId, codeFileContent)
	if err != nil {
		fmt.Println(err)
		return
	}
	//fmt.Println(totalTests)
	//fmt.Println(passedCasesCount)
	var temp float64
	//fmt.Println(float64(passedCasesCount * maxMarks))
	//fmt.Println(float64(totalTests))
	temp = float64(passedCasesCount*maxMarks) / float64(totalTests)
	marks := int(math.Round(temp)) // Round temp before converting to int
	fmt.Println(temp, marks, maxMarks)
	if !pass {
		fmt.Println("number of testcases passed", passedCasesCount)
		fmt.Println("Error in submitting question:", errString)
		//marks = 0
	}
	err = m.DB.SubmitQuestion(marks, username, questionId)
	if err != nil {
		fmt.Println(err)
		return
	}
	//fmt.Println(pass, errString)
	response := map[string]interface{}{
		"success": true,
	}
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		fmt.Println("Error encoding json", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
}

func (m *Repository) SendQuestionDetailsForEditor(w http.ResponseWriter, r *http.Request) {
	questionId := chi.URLParam(r, "questionId")
	//fmt.Println(questionId)
	username := r.Context().Value("username").(string)
	questionText, err := m.DB.GetQuestionTextFromId(questionId)
	if err != nil {
		fmt.Println("Error getting question text", err)
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}
	courseCode, assignmentId, firstTestCase, err := m.DB.GetCourseCodeAndAssignmentIdFromQuestionId(questionId)
	if err != nil {
		fmt.Println("Error getting course code and assignment id", err)
		return
	}
	isAttempted, err := m.DB.GetQuestionAttemptedStatus(username, questionId)
	if err != nil {
		fmt.Println("Error getting question attempted status", err)
		return
	}
	response := map[string]interface{}{
		"success":             true,
		"questionText":        questionText,
		"courseCode":          courseCode,
		"assignmentId":        assignmentId,
		"firstTestCaseInput":  firstTestCase[0],
		"firstTestCaseOutput": firstTestCase[1],
		"status":              isAttempted,
	}
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		fmt.Println("Error encoding json", err)
		w.WriteHeader(http.StatusInternalServerError)
	}
}

func (m *Repository) SubmitAssignment(w http.ResponseWriter, r *http.Request) {
	username := r.Context().Value("username").(string)
	assignmentId := chi.URLParam(r, "assignmentId")
	err := m.DB.SubmitAssignment(assignmentId, username)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		fmt.Println("Error submitting assignment", err)
		return
	}
	response := map[string]interface{}{
		"success": true,
	}
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		fmt.Println("Error encoding json", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	//w.WriteHeader(http.StatusOK)
	//w.Write([]byte("Assignment submitted successfully"))
}

func (m *Repository) ShowAllSubmittedAssignment(w http.ResponseWriter, r *http.Request) {
	//username := chi.URLParam(r, "username")
	assignmentId := chi.URLParam(r, "assignmentId")

	subDetails, err := m.DB.GetSubmissionDetailsForProfessor(assignmentId)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		fmt.Println("Error getting submission details", err)
		return
	}
	response := map[string]interface{}{
		"success":    true,
		"subDetails": subDetails,
	}
	//fmt.Println(subDetails)
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		fmt.Println("Error encoding json", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
}

func (m *Repository) GetRole(w http.ResponseWriter, r *http.Request) {
	role, ok := r.Context().Value("role").(string)
	//fmt.Println(role)
	if !ok {
		//w.WriteHeader(http.StatusBadRequest)
		fmt.Println("you have no role", ok, "role", role)
		response := map[string]interface{}{
			"success": false,
			"role":    role,
		}
		err := json.NewEncoder(w).Encode(response)
		if err != nil {
			fmt.Println("Error encoding json", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
	} else {
		response := map[string]interface{}{
			"success": true,
			"role":    role,
		}
		err := json.NewEncoder(w).Encode(response)
		if err != nil {
			fmt.Println("Error encoding json", err)
			//w.WriteHeader(http.StatusInternalServerError)
			return
		}
	}
}

func (m *Repository) AllAssignmentOfStudent(w http.ResponseWriter, r *http.Request) {
	username := r.Context().Value("username").(string)

	assignments, err := m.DB.GetAllAssignmentsForStudents(username)
	if errors.Is(err, errors.New("no tasks Assigned")) {
		w.WriteHeader(http.StatusBadRequest)
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		fmt.Println("no tasks assigned", err)
		return
	} else if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		fmt.Println("Error getting assignments", err)
		return
	}
	response := map[string]interface{}{
		"success":     true,
		"assignments": assignments,
	}
	//fmt.Println(assignments)
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		fmt.Println("Error encoding json", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
}

func (m *Repository) SubmittedAssignmentForStudent(w http.ResponseWriter, r *http.Request) {
	username := r.Context().Value("username").(string)
	submittedAssignments, err := m.DB.GetAllSubmittedAssignmentsForStudents(username)
	if errors.Is(err, errors.New("no submitted assignments")) {
		w.WriteHeader(http.StatusBadRequest)
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		fmt.Println("no submitted assignments", err)
		response := map[string]interface{}{
			"success": false,
			"error":   "no submitted assignments",
		}
		err = json.NewEncoder(w).Encode(response)
		if err != nil {
			fmt.Println("Error encoding json", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		return
	} else if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		fmt.Println("Error getting submitted assignments", err)
		response := map[string]interface{}{
			"success": false,
			"error":   "error getting submitted assignments",
		}
		err = json.NewEncoder(w).Encode(response)
		if err != nil {
			fmt.Println("Error encoding json", err)
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		return
	}
	//fmt.Println(submittedAssignments)
	response := map[string]interface{}{
		"success":     true,
		"assignments": submittedAssignments,
	}
	err = json.NewEncoder(w).Encode(response)
	if err != nil {
		fmt.Println("Error encoding json", err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
}

func (m *Repository) DownloadStats(w http.ResponseWriter, r *http.Request) {
	var reqBody struct {
		AssignmentIds []string `json:"assignmentIds"`
	}

	// Use io.LimitReader to prevent potential DOS attacks by limiting request body size
	if err := json.NewDecoder(io.LimitReader(r.Body, 1048576)).Decode(&reqBody); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Create a channel to collect submission data
	submissionChan := make(chan []SentData.DataForDownload, len(reqBody.AssignmentIds))
	errChan := make(chan error, len(reqBody.AssignmentIds))

	// Use a wait group to manage concurrent goroutines
	var wg sync.WaitGroup
	wg.Add(len(reqBody.AssignmentIds))

	// Concurrent fetch of submission details
	for _, assignmentID := range reqBody.AssignmentIds {
		go func(id string) {
			defer wg.Done()
			subData, err := m.DB.GetSubmissionDetailsForProfessorToDownload(id)
			if err != nil {
				errChan <- fmt.Errorf("error fetching submissions for assignment %s: %w", id, err)
				return
			}
			submissionChan <- subData
		}(assignmentID)
	}

	// Wait for all goroutines to complete
	wg.Wait()
	close(submissionChan)
	close(errChan)

	// Check for any errors
	if len(errChan) > 0 {
		var errMsgs []string
		for err := range errChan {
			errMsgs = append(errMsgs, err.Error())
		}
		fmt.Println(errMsgs)
		http.Error(w, strings.Join(errMsgs, "; "), http.StatusInternalServerError)
		return
	}

	// Collect all submission data
	var allData []SentData.DataForDownload
	for data := range submissionChan {
		allData = append(allData, data...)
	}

	// Prepare CSV
	w.Header().Set("Content-Type", "text/csv")
	w.Header().Set("Content-Disposition", `attachment; filename="submissions.csv"`)

	writer := csv.NewWriter(w)
	defer writer.Flush()

	// Prepare CSV rows with header
	csvRows := [][]string{
		{"Assignment Name", "Roll Number", "Username", "Marks", "Submission Time"},
	}

	// Convert submission data to CSV rows
	for _, s := range allData {
		csvRows = append(csvRows, []string{
			s.AssignmentName,
			s.RollNumber,
			s.Username,
			strconv.Itoa(s.Marks),
			s.SubmissionTime.UTC().Format("01/02/2006 15:04:05"), // check agar t ko replace kar sakte hai " "se
		})
	}
	writer.UseCRLF = true
	// Write all rows at once
	if err := writer.WriteAll(csvRows); err != nil {
		fmt.Println(err)
		http.Error(w, "Failed to write CSV", http.StatusInternalServerError)
	}
}

func (m *Repository) RunCode(w http.ResponseWriter, r *http.Request) {
	if err := godotenv.Load(); err != nil {
		fmt.Println("Error loading environment variables:", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}
	err := r.ParseMultipartForm(10 << 20)
	if err != nil {
		fmt.Println("Error in parsing multipart form:", err)
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusBadRequest)
		return
	}
	cfile, cfileExists := r.MultipartForm.File["codeFile"]
	if !cfileExists || len(cfile) == 0 {
		http.Error(w, fmt.Sprintf("Code file for question is missing"), http.StatusBadRequest)
		return
	}
	codeFile, err := cfile[0].Open()
	if err != nil {
		http.Error(w, "Error opening code file", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}
	codeFileContent, err := io.ReadAll(codeFile)
	if err != nil {
		http.Error(w, "Error reading code file", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}
	client := &http.Client{
		Timeout: 30 * time.Second,
	}
	firstTestCaseInput := r.FormValue("firstTestCaseInput")
	firstTestCaseOutput := r.FormValue("firstTestCaseOutput")
	actualOutput, err1 := helpers.ExecuteCodeOnJudge0(client, string(codeFileContent), firstTestCaseInput, firstTestCaseOutput, os.Getenv("JUDGE0_URL"))
	//fmt.Println(actualOutput)
	errorFound := fmt.Sprintf("%v", err1)
	response := map[string]interface{}{
		"status":       true,
		"err":          errorFound,
		"actualOutput": actualOutput,
	}
	//fmt.Println(fmt.Errorf("%v", err1))
	err2 := json.NewEncoder(w).Encode(response)
	if err2 != nil {
		fmt.Println("Error in encoding json")
		return
	}
}
