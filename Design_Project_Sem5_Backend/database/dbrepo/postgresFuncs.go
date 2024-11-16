package dbrepo

import (
	"DesignProjectBackend/models/RecievedData"
	"DesignProjectBackend/models/SentData"
	"context"
	"database/sql"
	"errors"
	"fmt"
	"golang.org/x/crypto/bcrypt"
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

func (m *PostgresRepo) GetRoleFromUserName(name string) (string, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()
	var role string
	query := `SELECT role FROM users WHERE username=$1`
	row := m.DB.QueryRowContext(ctx, query, name)
	err := row.Scan(&role)
	if err != nil {
		return "", err
	}
	return role, nil
}

func (m *PostgresRepo) GetAllCoursesForStudent(name string) ([]SentData.CourseData, error) {
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
			s.username = $1;
		`
	rows, err := m.DB.QueryContext(ctx, query, name)
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
func (m *PostgresRepo) Get3RecentAssignments(name string) ([]SentData.AssignmentData, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	var data []SentData.AssignmentData
	defer cancel()
	query := `SELECT 
		c.course_code,
		c.course_name,
		a.assignment_name,
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
		u.username = $1
	ORDER BY 
		a.start_time DESC
	LIMIT 3;
	`
	rows, err := m.DB.QueryContext(ctx, query, name)
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
		err = rows.Scan(&assignmentData.CourseCode, &assignmentData.CourseName, &assignmentData.AssignmentName, &assignmentData.StartTime)
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

func (m *PostgresRepo) GetAllCoursesForAuthor(name string) ([]SentData.CourseData, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()
	var courses []SentData.CourseData
	query := `SELECT c.course_name,c.course_code,c.course_id
	FROM COURSES as c
	JOIN users as u ON c.author_id = u.user_id
	WHERE u.username = $1
	`
	rows, err := m.DB.QueryContext(ctx, query, name)
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

func (m *PostgresRepo) AddCourse(username, courseCode, courseName, batchYear, branch string) error {
	tx, err := m.DB.Begin()
	if err != nil {
		fmt.Println("Error creating course:", err)
		return err
	}
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()
	query := `INSERT INTO courses (course_id, author_id, course_code, course_name, created_at,updated_at)
        VALUES (
            gen_random_uuid(),
            (SELECT user_id FROM users WHERE username = $1),
            $2,
            $3,
            CURRENT_TIMESTAMP,
            CURRENT_TIMESTAMP
        );`
	_, err = tx.ExecContext(ctx, query, username, courseCode, courseName)
	if err != nil {
		fmt.Println("Error adding course:", err)
		return err
	}
	branchCode := "51"
	if branch == "IT" {
		branchCode = "52"
	} else if branch == "BOTH" {
		branchCode = ""
	}
	emailPattern := fmt.Sprintf("%s%s%%", batchYear, branchCode)
	query = `SELECT user_id from users where email LIKE $1`
	rows, err := tx.QueryContext(ctx, query, emailPattern)
	if err != nil {
		fmt.Println("Error adding course:", err)
		err1 := tx.Rollback()
		if err1 != nil {
			fmt.Println("Error adding course", err1)
			return err
		}
		return err
	}
	for rows.Next() {
		var userId int
		err = rows.Scan(&userId)
		if err != nil {
			fmt.Println("Error scanning course:", err)
			err1 := tx.Rollback()
			if err1 != nil {
				fmt.Println("Error scanning course:", err1)
				return err1
			}
			return err
		}
		query1 := `INSERT INTO enrollments (course_id, user_id, enrollment_date) VALUES (SELECT course_id from courses where courseCode=$1,$2,CURRENT_TIMESTAMP)`
		_, err = tx.ExecContext(ctx, query1, courseCode, userId)
		if err != nil {
			fmt.Println("Error adding enrollment:", err)
			err1 := tx.Rollback()
			if err1 != nil {
				fmt.Println("Error adding enrollment:", err1)
				return err1
			}
			return err
		}
	}
	return nil
}

func (m *PostgresRepo) GetAssignmentsForCourse(courseCode string) ([]SentData.AssignmentData, error) {
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
	`
	_, err = tx.ExecContext(ctx, query, assignment.CourseCode, assignment.AssignmentName, assignment.StartTime, assignment.EndTime)
	if err != nil {
		fmt.Println("Error adding assignment:", err)
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
		VALUES ((SELECT assignment_id FROM assignments WHERE assignment_name= $1),$2,$3,$4,$5)
		`
		_, err = tx.ExecContext(ctx, query, assignment.AssignmentName, question.QuestionText, question.MaxScore, question.TestCasesFile, question.CodeFile)
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

func (m *PostgresRepo) GetAllQuestionsForAssignment(assignmentId string) ([]SentData.Question, error) {
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*10)
	defer cancel()
	var questions []SentData.Question
	query := `SELECT question_id,question_text,max_score,testcases_file 
			FROM questions where assignment_id=$1
			`
	rows, err := m.DB.QueryContext(ctx, query, assignmentId)
	if err != nil {
		fmt.Println("Error finding all questions:", err)
		return []SentData.Question{}, err
	}
	for rows.Next() {
		var question SentData.Question
		err = rows.Scan(&question.QuestionId, &question.QuestionText, &question.MaxScore, &question.TestCasesFile)
		if err != nil {
			fmt.Println("Error scanning all questions:", err)
			return []SentData.Question{}, err
		}
		questions = append(questions, question)
	}
	return questions, nil
}
