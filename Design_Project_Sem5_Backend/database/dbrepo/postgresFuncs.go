package dbrepo

import (
	"DesignProjectBackend/models/RecievedData"
	"DesignProjectBackend/models/SentData"
	"bytes"
	"context"
	"database/sql"
	"encoding/csv"
	"errors"
	"fmt"
	"github.com/lib/pq"
	"golang.org/x/crypto/bcrypt"
	"log"
	"time"
)

func (m *PostgresRepo) SignUpUser(user RecievedData.User) error {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()
	query := `INSERT INTO users(username, email, password_hash,role,verified) VALUES ($1, $2, $3,$4,$5)`
	hashedPass, err := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	if err != nil {
		fmt.Println("Error hashing password", err)
		return err
	}
	_, err = m.DB.ExecContext(ctx, query, user.Name, user.Email, hashedPass, "student", false)
	if err != nil {
		fmt.Println("Error signing Up user", err)
		return err
	}
	return nil
}

func (m *PostgresRepo) InsertOtp(otp int, email string) error {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()
	query := `INSERT INTO user_otps(email,otp,expires_at) VALUES ($1, $2, $3)`
	_, err := m.DB.ExecContext(ctx, query, email, otp, time.Now().Add((time.Minute)*5))
	if err != nil {
		fmt.Println("Error inserting Otp", err)
		return err
	}
	return nil
}

func (m *PostgresRepo) VerifyOTP(data RecievedData.OtpDetails) (bool, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()
	query := `SELECT otp,expires_at FROM user_otps WHERE email =$1`
	row := m.DB.QueryRowContext(ctx, query, data.Email)
	if row == nil {
		return false, errors.New("email not found")
	}
	var otp int
	var expiresAt time.Time
	err := row.Scan(&otp, &expiresAt)
	if err != nil {
		return false, err
	}
	if otp != data.OtpCode {
		return false, errors.New("invalid otp code")
	} else if time.Now().After(expiresAt) {
		return false, errors.New("otp expired")
	} else {
		return true, nil
	}
}
func (m *PostgresRepo) MarkUserVerified(data RecievedData.OtpDetails) error {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()
	query := `UPDATE users SET verified=true WHERE email=$1`
	_, err := m.DB.ExecContext(ctx, query, data.Email)
	if err != nil {
		return err
	}
	return nil
}

func (m *PostgresRepo) DeleteOTP(data RecievedData.OtpDetails) error {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()
	query := `DELETE FROM user_otps WHERE email=$1`
	_, err := m.DB.ExecContext(ctx, query, data.Email)
	if err != nil {
		return err
	}
	return nil
}

func (m *PostgresRepo) Login(email, password string) (string, bool, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()

	var userName, pass string
	var verification bool
	query := `SELECT username, password_hash, verified FROM users WHERE email = $1`

	// Use QueryRowContext for a single row result
	row := m.DB.QueryRowContext(ctx, query, email)
	err := row.Scan(&userName, &pass, &verification)
	if err != nil {
		if err == sql.ErrNoRows {
			// No user found with the provided email
			return "", false, errors.New("user not found")
		}
		fmt.Println("Error scanning user data:", err)
		return "", false, err
	}

	// Compare the provided password with the stored hash
	err = bcrypt.CompareHashAndPassword([]byte(pass), []byte(password))
	if err != nil {
		fmt.Println("Invalid password:", err)
		return "", false, errors.New("invalid password")
	}

	return userName, verification, nil
}

func (m *PostgresRepo) GetRoleFromEmail(email string) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()
	var role string
	query := `SELECT role FROM users WHERE email=$1`
	row := m.DB.QueryRowContext(ctx, query, email)
	err := row.Scan(&role)
	if err != nil {
		return "", err
	}
	return role, nil
}

func (m *PostgresRepo) GetAllCoursesForStudent(email string) ([]SentData.CourseData, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	var data []SentData.CourseData
	defer cancel()
	query := `SELECT 
			c.course_name,
			c.course_code,
			e.course_id,
			u.username AS author_name
		FROM 
			users AS s
		JOIN 
			enrollments AS e ON s.user_id = e.student_id
		JOIN 
			courses AS c ON e.course_id = c.course_id
		JOIN 
			users AS u ON c.author_id = u.user_id
		WHERE 
			s.email = $1;
		`
	rows, err := m.DB.QueryContext(ctx, query, email)
	if errors.Is(err, sql.ErrNoRows) {
		fmt.Println("No courses enrolled by student")
		err = errors.New("no courses enrolled by student")
		return []SentData.CourseData{}, err
	} else if err != nil {
		fmt.Println("Error getting all courses:", err)
		return []SentData.CourseData{}, err
	}
	for rows.Next() {
		var courseData SentData.CourseData
		err = rows.Scan(&courseData.CourseName, &courseData.CourseCode, &courseData.CourseId, &courseData.AuthorName)
		if err != nil {
			fmt.Println("Error scanning courses:", err)
			return []SentData.CourseData{}, err
		}
		data = append(data, courseData)
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			fmt.Println("Error closing rows:", err)
			return
		}
	}(rows)
	return data, nil
}
func (m *PostgresRepo) Get3RecentAssignments(email string) ([]SentData.AssignmentData, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	var data []SentData.AssignmentData
	defer cancel()
	query := `SELECT 
		c.course_code,
		c.course_name,
		a.assignment_name,
		a.assignment_id,
		a.start_time AS assignment_start_time
	FROM 
		users AS u
	JOIN 
		enrollments AS e ON u.user_id = e.student_id
	JOIN 
		courses AS c ON e.course_id = c.course_id
	JOIN 
		assignments AS a ON c.course_id = a.course_id
	WHERE 
		u.email = $1
	ORDER BY 
		a.start_time DESC
	LIMIT 3;
	`
	rows, err := m.DB.QueryContext(ctx, query, email)
	if errors.Is(err, sql.ErrNoRows) {
		fmt.Println("No tasks Assigned")
		err = errors.New("no tasks Assigned")
		return []SentData.AssignmentData{}, err
	} else if err != nil {
		fmt.Println("Error getting recent Assignments:", err)
		return []SentData.AssignmentData{}, err
	}
	for rows.Next() {
		var assignmentData SentData.AssignmentData
		err = rows.Scan(&assignmentData.CourseCode, &assignmentData.CourseName, &assignmentData.AssignmentName, &assignmentData.AssignmentId, &assignmentData.StartTime)
		if err != nil {
			fmt.Println("Error scanning assignments:", err)
			return []SentData.AssignmentData{}, err
		}
		data = append(data, assignmentData)
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			fmt.Println("Error closing rows:", err)
			return
		}
	}(rows)
	return data, nil
}

func (m *PostgresRepo) GetAllCoursesForAuthor(email string) ([]SentData.CourseData, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()
	var courses []SentData.CourseData
	query := `SELECT c.course_name,c.course_code,c.course_id
	FROM COURSES as c
	JOIN users as u ON c.author_id = u.user_id
	WHERE u.email = $1
	`
	rows, err := m.DB.QueryContext(ctx, query, email)
	if errors.Is(err, sql.ErrNoRows) {
		fmt.Println("No courses enrolled by professor")
		err = errors.New("no courses enrolled by professor")
		return []SentData.CourseData{}, err
	} else if err != nil {
		fmt.Println("Error getting professor's all courses", err)
		return []SentData.CourseData{}, err
	}
	for rows.Next() {
		var courseData SentData.CourseData
		err = rows.Scan(&courseData.CourseName, &courseData.CourseCode, &courseData.CourseId)
		if err != nil {
			fmt.Println("Error scanning courses:", err)
			return []SentData.CourseData{}, err
		}
		courses = append(courses, courseData)
	}
	return courses, nil
}

func (m *PostgresRepo) AddCourse(email, courseCode, courseName, batchYear, branch string) error {
	maxRetries := 3
	var lastErr error

	for attempt := 0; attempt < maxRetries; attempt++ {
		if attempt > 0 {
			log.Printf("Retrying operation (attempt %d/%d)", attempt+1, maxRetries)
			time.Sleep(time.Second * time.Duration(attempt)) // Exponential backoff
		}

		err := m.executeAddCourse(email, courseCode, courseName, batchYear, branch)
		if err == nil {
			return nil
		}

		lastErr = err
		if err == sql.ErrConnDone || err.Error() == "driver: bad connection" {
			log.Printf("Connection error detected, attempting to reconnect: %v", err)
			if err := m.reconnectDB(); err != nil {
				log.Printf("Failed to reconnect: %v", err)
				continue
			}
		} else {
			// If it's not a connection error, don't retry
			return err
		}
	}

	return fmt.Errorf("failed after %d attempts, last error: %v", maxRetries, lastErr)
}

func (m *PostgresRepo) reconnectDB() error {
	if m.DB != nil {
		_ = m.DB.Close() // Best effort close
	}

	// Assuming you have access to the DSN or connection parameters
	db, err := sql.Open("pgx", "host=localhost port=5432 dbname=DesignProject user=yash password=123 connect_timeout=10")
	if err != nil {
		return fmt.Errorf("failed to open new connection: %v", err)
	}

	// Test the connection
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := db.PingContext(ctx); err != nil {
		db.Close()
		return fmt.Errorf("failed to ping new connection: %v", err)
	}

	m.DB = db
	return nil
}

func (m *PostgresRepo) executeAddCourse(email, courseCode, courseName, batchYear, branch string) error {
	ctx, cancel := context.WithTimeout(context.Background(), time.Minute)
	defer cancel()

	// Start transaction
	tx, err := m.DB.BeginTx(ctx, &sql.TxOptions{
		Isolation: sql.LevelSerializable,
		ReadOnly:  false,
	})
	if err != nil {
		return fmt.Errorf("failed to begin transaction: %w", err)
	}

	// Improved defer for transaction handling
	defer func() {
		if p := recover(); p != nil {
			_ = tx.Rollback()
			panic(p)
		}
	}()

	// Insert course
	log.Printf("Inserting course: %s %s %s %s", courseName, courseCode, batchYear, branch)
	query := `
        INSERT INTO courses (course_id, author_id, course_code, course_name, created_at, updated_at)
        VALUES (gen_random_uuid(),
                (SELECT user_id FROM users WHERE email = $1), $2, $3,
                CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        RETURNING course_id`

	var courseID string
	err = tx.QueryRowContext(ctx, query, email, courseCode, courseName).Scan(&courseID)
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to insert course: %w", err)
	}

	// Determine branch code
	branchCode := "51" // Default for CSE
	switch branch {
	case "IT":
		branchCode = "52"
	case "Both":
		branchCode = ""
	}

	// Handle enrollments
	emailPattern := fmt.Sprintf("%s%s%%", batchYear, branchCode)
	log.Printf("Finding users for enrollment with pattern: %s", emailPattern)

	query = `SELECT user_id FROM users WHERE email LIKE $1`
	rows, err := tx.QueryContext(ctx, query, emailPattern)
	if err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to query users: %w", err)
	}
	defer rows.Close()

	// Batch insert enrollments
	var userIDs []string
	for rows.Next() {
		var userID string
		if err = rows.Scan(&userID); err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to scan user ID: %w", err)
		}
		userIDs = append(userIDs, userID)
	}

	if err = rows.Err(); err != nil {
		tx.Rollback()
		return fmt.Errorf("error iterating rows: %w", err)
	}

	// Batch insert enrollments if we have users
	if len(userIDs) > 0 {
		enrollmentQuery := `
            INSERT INTO enrollments (course_id, student_id, enrollment_date)
            SELECT $1, unnest($2::uuid[]), CURRENT_TIMESTAMP`

		_, err = tx.ExecContext(ctx, enrollmentQuery, courseID, pq.Array(userIDs))
		if err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to insert enrollments: %w", err)
		}
	}

	// Commit transaction
	if err = tx.Commit(); err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	log.Printf("Successfully added course and enrolled %d users", len(userIDs))
	return nil
}

func (m *PostgresRepo) GetAssignmentsForCourse(email, courseCode string) ([]SentData.AssignmentData, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()

	var assignments []SentData.AssignmentData
	query := `SELECT a.assignment_id, a.assignment_name, a.start_time, a.expiration_time,c.course_name 
		FROM assignments as a
		JOIN courses as c ON c.course_id = a.course_id
		WHERE c.course_code = $1`

	rows, err := m.DB.QueryContext(ctx, query, courseCode)
	if errors.Is(err, sql.ErrNoRows) {
		fmt.Println("No assignments yet for this course")
		err = errors.New("no assignments assigned")
		return []SentData.AssignmentData{}, err
	} else if err != nil {
		fmt.Println("Error finding assignments")
		return []SentData.AssignmentData{}, err
	}
	defer rows.Close()

	for rows.Next() {
		var assignment SentData.AssignmentData
		err = rows.Scan(&assignment.AssignmentId, &assignment.AssignmentName, &assignment.StartTime, &assignment.EndTime, &assignment.CourseName)
		if err != nil {
			fmt.Println("Error scanning assignments:", err)
			return []SentData.AssignmentData{}, err
		}
		assignment.CourseCode = courseCode
		assignments = append(assignments, assignment)
	}

	// Query for checking submission status
	query = `SELECT COUNT(1)
             FROM assignment_grades
             WHERE assignment_id = $1 AND student_id=(SELECT user_id from users where email = $2)`

	for i := range assignments {
		assignment := assignments[i]
		var temp int
		row := m.DB.QueryRowContext(ctx, query, assignment.AssignmentId, email)
		err = row.Scan(&temp)
		if err != nil {
			fmt.Println("Error checking submission status:", err)
			return []SentData.AssignmentData{}, err
		}
		assignments[i].Submitted = temp == 1
	}
	return assignments, nil
}

func (m *PostgresRepo) AddAssignment(assignment RecievedData.Assignment) error {
	tx, err := m.DB.Begin()
	if err != nil {
		fmt.Println("Error adding assignment:", err)
		return err
	}
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()
	query := `INSERT INTO assignments (course_id, assignment_name, start_time, expiration_time, created_at)
	VALUES ((SELECT course_id FROM courses WHERE course_code= $1),$2,$3,$4,CURRENT_TIMESTAMP)
	RETURNING assignment_id
	`
	var assignmentId string
	row := tx.QueryRowContext(ctx, query, assignment.CourseCode, assignment.AssignmentName, assignment.StartTime, assignment.EndTime)
	err = row.Scan(&assignmentId)
	if err != nil {
		fmt.Println("Error adding assignment scanning assignmentId:", err)
		err1 := tx.Rollback()
		if err1 != nil {
			fmt.Println("Error rolling back:", err1)
			return err1
		}
		return errors.New("error inserting assignment: ")
	}

	for i := 0; i < len(assignment.Questions); i++ {
		question := assignment.Questions[i]
		query := `INSERT INTO questions (assignment_id,question_text,max_score,testcases_file,correct_code_file)
		VALUES ($1,$2,$3,$4,$5)
		`
		_, err = tx.ExecContext(ctx, query, assignmentId, question.QuestionText, question.MaxScore, question.TestCasesFile, question.CodeFile)
		if err != nil {
			fmt.Println("Error adding question:", err)
			err1 := tx.Rollback()
			if err1 != nil {
				fmt.Println("Error rolling back:", err1)
				return err1
			}
			return errors.New("error inserting question: ")
		}
	}
	err = tx.Commit()
	if err != nil {
		err = errors.New("error committing transaction")
		fmt.Println("Error adding assignment:", err)
		return err
	}
	return nil
}

func (m *PostgresRepo) GetAllQuestionsForAssignment(assignmentId, email string) ([]SentData.StudentAssignmentDetails, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()
	var questions []SentData.StudentAssignmentDetails

	// Updated query with table aliases
	query := `SELECT q.question_id, q.max_score, a.assignment_name 
              FROM questions AS q 
              JOIN assignments AS a ON a.assignment_id = q.assignment_id
              WHERE q.assignment_id = $1`

	rows, err := m.DB.QueryContext(ctx, query, assignmentId)
	if err != nil {
		fmt.Println("Error finding all questions:", err)
		return []SentData.StudentAssignmentDetails{}, err
	}
	defer rows.Close() // Ensure the rows are closed after use

	for rows.Next() {
		var question SentData.StudentAssignmentDetails
		err = rows.Scan(&question.QuestionId, &question.MaxScore, &question.AssignmentName) // Include all selected columns
		if err != nil {
			fmt.Println("Error scanning all questions:", err)
			return []SentData.StudentAssignmentDetails{}, err
		}
		questions = append(questions, question)
	}

	// Query for checking submission status
	query = `SELECT COUNT(1)
             FROM submissions
             WHERE assignment_id = $1 AND question_id = $2 AND student_id=(SELECT user_id from users where email = $3)`

	for i := range questions {
		var temp int
		row := m.DB.QueryRowContext(ctx, query, assignmentId, questions[i].QuestionId, email)
		err = row.Scan(&temp)
		if err != nil {
			fmt.Println("Error checking submission status:", err)
			return []SentData.StudentAssignmentDetails{}, err
		}
		questions[i].QuestionStatus = temp == 1
	}

	return questions, nil
}

func (m *PostgresRepo) GetQuestionTextFromId(questionId string) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()
	var questionText string
	query := `SELECT question_text FROM questions where question_id = $1`
	row := m.DB.QueryRowContext(ctx, query, questionId)
	err := row.Scan(&questionText)
	if err != nil {
		return "", err
	}
	return questionText, nil
}

func (m *PostgresRepo) GetTestCasesFromQuestionId(questionId string) ([]byte, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()
	var testCases []byte
	query := `SELECT testcases_file from questions where question_id = $1`
	row := m.DB.QueryRowContext(ctx, query, questionId)
	err := row.Scan(&testCases)
	if err != nil {
		fmt.Println("Error getting test cases from database:", err)
		return nil, err
	}
	return testCases, nil
}

func (m *PostgresRepo) AddSubmission(email, questionId string, codeFile []byte) error {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()

	query := `
		INSERT INTO submissions 
		(student_id, assignment_id, question_id, submitted_at, is_submitted, submitted_code)
		VALUES (
			(SELECT user_id FROM users WHERE email = $1),
			(SELECT assignment_id FROM questions WHERE question_id = $2),
			$2, CURRENT_TIMESTAMP, $3, $4
		);
	`

	_, err := m.DB.ExecContext(ctx, query, email, questionId, true, codeFile)
	if err != nil {
		return fmt.Errorf("error adding submission: %w", err)
	}

	return nil
}

func (m *PostgresRepo) SubmitQuestion(marks int, email, questionId string) error {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()

	query := `
		INSERT INTO student_marks 
		(submission_id, user_id, marks, graded_at, comments) 
		VALUES (
			(SELECT submission_id FROM submissions 
			 WHERE question_id = $1 
			 AND student_id = (SELECT user_id FROM users WHERE email = $2)),
			(SELECT user_id FROM users WHERE email = $2),
			$3, CURRENT_TIMESTAMP, $4
		);
	`

	comment := "fail"
	if marks > 0 {
		comment = "pass"
	}

	_, err := m.DB.ExecContext(ctx, query, questionId, email, marks, comment)
	if err != nil {
		return fmt.Errorf("error adding student grades: %w", err)
	}

	return nil
}

func (m *PostgresRepo) GetCourseCodeAndAssignmentIdFromQuestionId(questionId string) (string, string, []string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()
	var courseCode string
	var assignmentId string
	var testcasesFile []byte
	//var firstTestCase string
	// SQL query to join tables and get course_code and assignment_id based on question_id
	query := `
        SELECT c.course_code, a.assignment_id, q.testcases_file
        FROM questions q
        JOIN assignments a ON q.assignment_id = a.assignment_id
        JOIN courses c ON a.course_id = c.course_id
        WHERE q.question_id = $1;
    `

	// Execute the query
	row := m.DB.QueryRowContext(ctx, query, questionId)

	// Scan the results into the variables
	err := row.Scan(&courseCode, &assignmentId, &testcasesFile)
	if err != nil {
		if err == sql.ErrNoRows {
			return "", "", []string{}, fmt.Errorf("no course or assignment found for question id %s", questionId)
		}
		return "", "", []string{}, fmt.Errorf("error retrieving course code and assignment id: %v", err)
	}
	reader := csv.NewReader(bytes.NewReader(testcasesFile))
	testCases, err := reader.ReadAll()
	firstTestCase := testCases[1]
	// Return the results
	return courseCode, assignmentId, firstTestCase, nil
}

func (m *PostgresRepo) SubmitAssignment(assignmentId string, email string) error {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()
	query := `
				WITH student_id_cte AS (
				SELECT user_id
				FROM users
				WHERE email = $1 -- Replace $1 with the username
				),
				total_marks_cte AS (
					SELECT 
						sm.user_id,
						q.assignment_id,
						SUM(sm.marks) AS total_marks
					FROM 
						student_marks sm
					INNER JOIN submissions s ON sm.submission_id = s.submission_id
					INNER JOIN questions q ON s.question_id = q.question_id
					WHERE 
						sm.user_id = (SELECT user_id FROM student_id_cte)
						AND q.assignment_id = $2 -- Replace $2 with the assignment_id
					GROUP BY sm.user_id, q.assignment_id
				)
				INSERT INTO assignment_grades (student_id, assignment_id, total_score, graded_at)
				SELECT 
					tmc.user_id,
					tmc.assignment_id,
					tmc.total_marks,
					CURRENT_TIMESTAMP
				FROM 
					total_marks_cte tmc
				ON CONFLICT (student_id, assignment_id) 
				DO UPDATE SET total_score = EXCLUDED.total_score, graded_at = EXCLUDED.graded_at;
				`
	_, err := m.DB.ExecContext(ctx, query, email, assignmentId)
	if err != nil {
		fmt.Println("Failed to insert into assignment_grades:", err)
		return err
	}
	return nil
}

func (m *PostgresRepo) GetMarksFromQuestionId(questionId string) (int, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()
	var marks int
	query := `SELECT max_score from questions where question_id = $1`
	row := m.DB.QueryRowContext(ctx, query, questionId)
	err := row.Scan(&marks)
	if err == sql.ErrNoRows {
		return -1, fmt.Errorf("no course or assignment found for question id %s", questionId)
	} else if err != nil {
		return -1, err
	}
	return marks, nil
}

func (m *PostgresRepo) GetSubmissionDetailsForProfessor(assignmentId string) ([]SentData.SubmissionData, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()

	query := `
       SELECT 
           u.username, 
           u.email, 
           asg.total_score, 
           asg.graded_at, 
           sub.submitted_code, 
           q.question_text
       FROM assignment_grades as asg
       JOIN users as u ON asg.student_id = u.user_id
       LEFT JOIN submissions as sub ON sub.assignment_id = asg.assignment_id AND sub.student_id = asg.student_id
       JOIN questions as q ON q.question_id = sub.question_id
       WHERE asg.assignment_id = $1
    `
	rows, err := m.DB.QueryContext(ctx, query, assignmentId)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return []SentData.SubmissionData{}, nil
		}
		return nil, fmt.Errorf("failed to query submission details: %w", err)
	}
	defer rows.Close()

	submissionMap := make(map[string]*SentData.SubmissionData)

	for rows.Next() {
		var username, email string
		var totalScore int
		var gradedAt time.Time
		var submittedCode []byte
		var questionText string

		err := rows.Scan(&username, &email, &totalScore, &gradedAt, &submittedCode, &questionText)
		if err != nil {
			return nil, fmt.Errorf("failed to scan submission row: %w", err)
		}

		// Ensure the submission entry exists
		if _, exists := submissionMap[username]; !exists {
			submissionMap[username] = &SentData.SubmissionData{
				Username:       username,
				RollNumber:     email[:9], // Assuming email contains roll number
				Marks:          totalScore,
				SubmissionTime: gradedAt,
				SubmittedData:  []SentData.SubmittedQuestion{},
			}
		}

		// Add submitted question if code exists
		if len(submittedCode) > 0 {
			submissionMap[username].SubmittedData = append(
				submissionMap[username].SubmittedData,
				SentData.SubmittedQuestion{
					QuestionText:  questionText,
					SubmittedCode: string(submittedCode),
				},
			)
		}
	}

	// Convert map to slice
	var submissions []SentData.SubmissionData
	for _, submission := range submissionMap {
		submissions = append(submissions, *submission)
	}

	return submissions, nil
}

func (m *PostgresRepo) GetQuestionAttemptedStatus(email, questionId string) (bool, error) {
	var questionSubmitted int
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()
	query := `SELECT COUNT(1)
             FROM submissions
             WHERE question_id = $1 AND student_id=(SELECT user_id from users where email = $2)
             `
	row := m.DB.QueryRowContext(ctx, query, questionId, email)
	err := row.Scan(&questionSubmitted)
	if err != nil {
		fmt.Println("Error checking submission status:", err)
		return false, err
	}
	return questionSubmitted == 1, nil
}

func (m *PostgresRepo) GetAllAssignmentsForStudents(email string) ([]SentData.AssignmentData, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	var data []SentData.AssignmentData
	defer cancel()
	query := `SELECT 
		c.course_code,
		c.course_name,
		a.assignment_name,
		a.assignment_id,
		a.expiration_time,
		a.start_time AS assignment_start_time
	FROM 
		users AS u
	JOIN 
		enrollments AS e ON u.user_id = e.student_id
	JOIN 
		courses AS c ON e.course_id = c.course_id
	JOIN 
		assignments AS a ON c.course_id = a.course_id
	WHERE 
		u.email = $1
	ORDER BY 
		a.start_time DESC
	`
	rows, err := m.DB.QueryContext(ctx, query, email)
	if errors.Is(err, sql.ErrNoRows) {
		fmt.Println("No tasks Assigned")
		err = errors.New("no tasks Assigned")
		return []SentData.AssignmentData{}, err
	} else if err != nil {
		fmt.Println("Error getting recent Assignments:", err)
		return []SentData.AssignmentData{}, err
	}
	for rows.Next() {
		var assignmentData SentData.AssignmentData
		err = rows.Scan(&assignmentData.CourseCode, &assignmentData.CourseName, &assignmentData.AssignmentName, &assignmentData.AssignmentId, &assignmentData.EndTime, &assignmentData.StartTime)
		if err != nil {
			fmt.Println("Error scanning assignments:", err)
			return []SentData.AssignmentData{}, err
		}
		data = append(data, assignmentData)
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			fmt.Println("Error closing rows:", err)
			return
		}
	}(rows)
	query = `SELECT COUNT(1)
             FROM assignment_grades
             WHERE assignment_id = $1 AND student_id=(SELECT user_id from users where email = $2)`

	for i := range data {
		assignment := data[i]
		var temp int
		row := m.DB.QueryRowContext(ctx, query, assignment.AssignmentId, email)
		err = row.Scan(&temp)
		if err != nil {
			fmt.Println("Error checking submission status:", err)
			return []SentData.AssignmentData{}, err
		}
		data[i].Submitted = temp == 1
	}
	return data, nil
}

func (m *PostgresRepo) GetAllSubmittedAssignmentsForStudents(email string) ([]SentData.SubmittedAssignmentData, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()
	var assignments []SentData.SubmittedAssignmentData
	query := `SELECT
			c.course_code,
			c.course_name,
			a.assignment_name,
			a.assignment_id,
			a.expiration_time,
			a.start_time AS assignment_start_time,
			s.graded_at,
			s.total_score
			FROM users as u
			JOIN 
				assignment_grades AS s ON u.user_id = s.student_id
			JOIN 
				assignments AS a ON s.assignment_id = a.assignment_id
			JOIN 
				courses AS c ON a.course_id = c.course_id
			WHERE u.email = $1
			`
	rows, err := m.DB.QueryContext(ctx, query, email)
	if errors.Is(err, sql.ErrNoRows) {
		fmt.Println("No submitted Assignments")
		err = errors.New("no submitted assignments")
		return []SentData.SubmittedAssignmentData{}, err
	} else if err != nil {
		fmt.Println("Error getting recent Assignments:", err)
		return []SentData.SubmittedAssignmentData{}, err
	}
	for rows.Next() {
		var assignmentData SentData.SubmittedAssignmentData
		err1 := rows.Scan(&assignmentData.CourseCode, &assignmentData.CourseName, &assignmentData.AssignmentName, &assignmentData.AssignmentId, &assignmentData.EndTime, &assignmentData.StartTime, &assignmentData.GradedTime, &assignmentData.ScoredMarks)
		if err1 != nil {
			fmt.Println("Error scanning submitted assignments:", err1)
			return []SentData.SubmittedAssignmentData{}, err1
		}
		assignments = append(assignments, assignmentData)
	}
	defer func(rows *sql.Rows) {
		err := rows.Close()
		if err != nil {
			fmt.Println("Error closing rows:", err)
			return
		}
	}(rows)
	return assignments, nil
}

func (m *PostgresRepo) GetSubmissionDetailsForProfessorToDownload(assignmentId string) ([]SentData.DataForDownload, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	query := `
        SELECT 
            u.username, 
            u.email, 
            asg.total_score, 
            asg.graded_at, 
            a.assignment_name
        FROM assignment_grades as asg
        JOIN users as u ON asg.student_id = u.user_id
        JOIN assignments as a ON a.assignment_id = asg.assignment_id
        LEFT JOIN submissions as sub ON 
            sub.assignment_id = asg.assignment_id AND 
            sub.student_id = asg.student_id
        WHERE asg.assignment_id = $1
    `

	rows, err := m.DB.QueryContext(ctx, query, assignmentId)
	if err != nil {
		return nil, fmt.Errorf("query failed: %w", err)
	}
	defer func(rows *sql.Rows) {
		err1 := rows.Close()
		if err1 != nil {
			fmt.Println("Error closing rows:", err)
		}
	}(rows)

	var subData []SentData.DataForDownload

	for rows.Next() {
		var studentData SentData.DataForDownload
		if err := rows.Scan(
			&studentData.Username,
			&studentData.RollNumber,
			&studentData.Marks,
			&studentData.SubmissionTime,
			&studentData.AssignmentName,
		); err != nil {
			return nil, fmt.Errorf("scan failed: %w", err)
		}

		studentData.RollNumber = studentData.RollNumber[:9]
		subData = append(subData, studentData)
	}
	return subData, nil
}

func (m *PostgresRepo) CheckIfAssignmentIsSubmitted(assignmentId, email string) (bool, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()
	query := `SELECT COUNT(1)
             FROM assignment_grades
             WHERE assignment_id = $1 AND student_id=(SELECT user_id from users where email = $2)
             `
	row := m.DB.QueryRowContext(ctx, query, assignmentId, email)
	var submitted int
	err := row.Scan(&submitted)
	if err != nil {
		fmt.Println("Error scanning row", err)
		return false, err
	}
	return submitted == 1, nil
}
