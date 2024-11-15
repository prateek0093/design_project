package handlers

import (
	"DesignProjectBackend/database"
	"DesignProjectBackend/database/dbrepo"
	"DesignProjectBackend/drivers"
	"DesignProjectBackend/models/RecievedData"
	"crypto/rand"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
	"io"
	"math/big"
	"net/http"
	"net/smtp"
	"os"
	"strconv"
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

	w.WriteHeader(http.StatusCreated)
	_, _ = w.Write([]byte("Course added successfully"))
}

func (m *Repository) AllAssignment(w http.ResponseWriter, r *http.Request) {
	courseCode := chi.URLParam(r, "id")
	fmt.Println("CourseCode:", courseCode)
	assignments, err := m.DB.GetAssignmentsForCourse(courseCode)
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
	newAssignment.StartTime, _ = time.Parse("2006-01-02", r.FormValue("startTime"))
	newAssignment.EndTime, _ = time.Parse("2006-01-02", r.FormValue("endTime"))
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

	// Here you can save the new assignment to the database (e.g., using ORM or raw SQL)
	err = m.DB.AddAssignment(newAssignment)
	if err != nil {
		http.Error(w, "Failed to add assignment", http.StatusInternalServerError)
		fmt.Println(err)
		return
	}
	//fmt.Println("NewAssignment", newAssignment)
	fmt.Println("newAssignment name:", newAssignment.AssignmentName, "newAssignment start time:", newAssignment.StartTime, "newAssignment end time:", newAssignment.EndTime)
	for i := 0; i < len(newAssignment.Questions); i++ {
		fmt.Println("newAssignment Question name:", newAssignment.Questions[0].QuestionText)
		fmt.Println("newAssignment Question code:", string(newAssignment.Questions[0].CodeFile))
		fmt.Println("newAssignment Question csv", string(newAssignment.Questions[0].TestCasesFile))
	}
	fmt.Println("courseCode", courseCode)

	// For now, let's just return a success message
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Assignment added successfully"))
}
