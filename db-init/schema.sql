--
-- PostgreSQL database dump
--

-- Dumped from database version 16.2
-- Dumped by pg_dump version 16.2

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;

--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

-- Create user only if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_catalog.pg_roles WHERE rolname = 'yash'
    ) THEN
        CREATE USER yash WITH PASSWORD '123';
    END IF;
END $$;

-- Create database only if it does not exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_database WHERE datname = 'DesignProject'
    ) THEN
        CREATE DATABASE DesignProject;
    END IF;
END $$;

--
-- Name: assignment_grades; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS public.assignment_grades (
    grade_id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    assignment_id uuid NOT NULL,
    total_score integer,
    graded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

--
-- Name: assignments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS public.assignments (
    assignment_id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_id uuid NOT NULL,
    assignment_name character varying(100) NOT NULL,
    start_time timestamp without time zone NOT NULL,
    expiration_time timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

--
-- Name: courses; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS public.courses (
    course_id uuid DEFAULT gen_random_uuid() NOT NULL,
    course_code character varying(20) NOT NULL,
    course_name character varying(100) NOT NULL,
    author_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

--
-- Name: enrollments; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS public.enrollments (
    course_id uuid NOT NULL,
    student_id uuid NOT NULL,
    enrollment_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

--
-- Name: questions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS public.questions (
    question_id uuid DEFAULT gen_random_uuid() NOT NULL,
    assignment_id uuid NOT NULL,
    question_text text NOT NULL,
    max_score integer NOT NULL,
    testcases_file bytea NOT NULL,
    correct_code_file bytea NOT NULL
);

--
-- Name: student_marks; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS public.student_marks (
    mark_id uuid DEFAULT gen_random_uuid() NOT NULL,
    submission_id uuid,
    user_id uuid,
    marks integer,
    graded_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    comments text,
    CONSTRAINT student_marks_marks_check CHECK ((marks >= 0))
);

--
-- Name: submissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS public.submissions (
    submission_id uuid DEFAULT gen_random_uuid() NOT NULL,
    student_id uuid NOT NULL,
    assignment_id uuid NOT NULL,
    question_id uuid NOT NULL,
    submitted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_submitted boolean DEFAULT true,
    submitted_code bytea NOT NULL
);

--
-- Name: user_otps; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS public.user_otps (
    email character varying(255) NOT NULL,
    otp integer NOT NULL,
    expires_at timestamp without time zone NOT NULL
);

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE IF NOT EXISTS public.users (
    user_id uuid DEFAULT gen_random_uuid() NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash text NOT NULL,
    role character varying(10) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    verified boolean DEFAULT false,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['author'::character varying, 'student'::character varying])::text[])))
);

-- Primary and Foreign Key Constraints
ALTER TABLE IF EXISTS public.assignment_grades
    ADD CONSTRAINT IF NOT EXISTS assignment_grades_pkey PRIMARY KEY (grade_id);
ALTER TABLE IF EXISTS public.assignment_grades
    ADD CONSTRAINT IF NOT EXISTS assignment_grades_student_id_assignment_id_key UNIQUE (student_id, assignment_id);
ALTER TABLE IF EXISTS public.assignments
    ADD CONSTRAINT IF NOT EXISTS assignments_pkey PRIMARY KEY (assignment_id);
ALTER TABLE IF EXISTS public.courses
    ADD CONSTRAINT IF NOT EXISTS courses_course_code_key UNIQUE (course_code);
ALTER TABLE IF EXISTS public.courses
    ADD CONSTRAINT IF NOT EXISTS courses_pkey PRIMARY KEY (course_id);
ALTER TABLE IF EXISTS public.enrollments
    ADD CONSTRAINT IF NOT EXISTS enrollments_pkey PRIMARY KEY (course_id, student_id);
ALTER TABLE IF EXISTS public.questions
    ADD CONSTRAINT IF NOT EXISTS questions_pkey PRIMARY KEY (question_id);
ALTER TABLE IF EXISTS public.student_marks
    ADD CONSTRAINT IF NOT EXISTS student_marks_pkey PRIMARY KEY (mark_id);
ALTER TABLE IF EXISTS public.submissions
    ADD CONSTRAINT IF NOT EXISTS submissions_pkey PRIMARY KEY (submission_id);
ALTER TABLE IF EXISTS public.submissions
    ADD CONSTRAINT IF NOT EXISTS submissions_student_id_assignment_id_question_id_key UNIQUE (student_id, assignment_id, question_id);
ALTER TABLE IF EXISTS public.user_otps
    ADD CONSTRAINT IF NOT EXISTS user_otps_pkey PRIMARY KEY (email);
ALTER TABLE IF EXISTS public.users
    ADD CONSTRAINT IF NOT EXISTS users_email_key UNIQUE (email);
ALTER TABLE IF EXISTS public.users
    ADD CONSTRAINT IF NOT EXISTS users_pkey PRIMARY KEY (user_id);

-- Foreign Key Constraints
ALTER TABLE IF EXISTS public.assignment_grades
    ADD CONSTRAINT IF NOT EXISTS assignment_grades_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.assignments(assignment_id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS public.assignment_grades
    ADD CONSTRAINT IF NOT EXISTS assignment_grades_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(user_id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS public.assignments
    ADD CONSTRAINT IF NOT EXISTS assignments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(course_id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS public.courses
    ADD CONSTRAINT IF NOT EXISTS courses_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(user_id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS public.enrollments
    ADD CONSTRAINT IF NOT EXISTS enrollments_course_id_fkey FOREIGN KEY (course_id) REFERENCES public.courses(course_id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS public.enrollments
    ADD CONSTRAINT IF NOT EXISTS enrollments_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(user_id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS public.questions
    ADD CONSTRAINT IF NOT EXISTS questions_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.assignments(assignment_id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS public.student_marks
    ADD CONSTRAINT IF NOT EXISTS student_marks_submission_id_fkey FOREIGN KEY (submission_id) REFERENCES public.submissions(submission_id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS public.student_marks
    ADD CONSTRAINT IF NOT EXISTS student_marks_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS public.submissions
    ADD CONSTRAINT IF NOT EXISTS submissions_assignment_id_fkey FOREIGN KEY (assignment_id) REFERENCES public.assignments(assignment_id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS public.submissions
    ADD CONSTRAINT IF NOT EXISTS submissions_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.questions(question_id) ON DELETE CASCADE;
ALTER TABLE IF EXISTS public.submissions
    ADD CONSTRAINT IF NOT EXISTS submissions_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.users(user_id) ON DELETE CASCADE;
