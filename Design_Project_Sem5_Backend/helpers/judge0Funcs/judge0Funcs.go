package helpers

import (
	"bytes"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"
)

// SubmissionResult represents the Judge0 submission response
type SubmissionResult struct {
	Output        string `json:"stdout"`
	Error         string `json:"stderr"`
	CompileOutput string `json:"compile_output"`
	Status        struct {
		ID          int    `json:"id"`
		Description string `json:"description"`
	} `json:"status"`
}

// TestResult represents the result of a single test case
type TestResult struct {
	Input          string
	ExpectedOutput string
	ActualOutput   string
	Error          error
	Passed         bool
	TestNumber     int
}

func ValidateCodeAgainstTestCases(code string, testCasesFile []byte, judge0URL string) (int, bool, string) {
	// Parse the CSV
	reader := csv.NewReader(bytes.NewReader(testCasesFile))
	testCases, err := reader.ReadAll()
	if err != nil {
		return 0, false, fmt.Sprintf("CSV parsing error: %v", err)
	}

	if len(testCases) <= 1 { // Only header or empty file
		return 0, false, "no test cases found"
	}

	totalTests := len(testCases) - 1 // Excluding header

	// Create a single HTTP client to reuse
	client := &http.Client{
		Timeout: 30 * time.Second,
	}

	// Create channels for results and concurrency control
	resultsChan := make(chan TestResult, totalTests)
	// Limit concurrent executions to avoid overwhelming the Judge0 service
	semaphore := make(chan struct{}, 10) // Allow up to 10 concurrent requests

	var wg sync.WaitGroup

	// Process test cases concurrently
	for i := 1; i < len(testCases); i++ { // Skip header
		wg.Add(1)
		go func(testNumber int, input, expectedOutput string) {
			defer wg.Done()

			// Acquire semaphore
			semaphore <- struct{}{}
			defer func() { <-semaphore }()

			// Execute test case
			actualOutput, err := ExecuteCodeOnJudge0(client, code, input, expectedOutput, judge0URL)

			passed := err == nil && strings.TrimSpace(actualOutput) == strings.TrimSpace(expectedOutput)

			resultsChan <- TestResult{
				Input:          input,
				ExpectedOutput: expectedOutput,
				ActualOutput:   actualOutput,
				Error:          err,
				Passed:         passed,
				TestNumber:     testNumber,
			}
		}(i, testCases[i][0], testCases[i][1])
	}

	// Close results channel when all goroutines complete
	go func() {
		wg.Wait()
		close(resultsChan)
	}()

	// Process all results
	passedTests := 0
	var failedTestDetails []string

	for result := range resultsChan {
		if result.Passed {
			passedTests++
		} else {
			var failureReason string
			if strings.TrimSpace(result.ActualOutput) != strings.TrimSpace(result.ExpectedOutput) {
				failureReason = fmt.Sprintf("Test case %d failed. Input: %s, Expected: %s, Got: %s with error: %v",
					result.TestNumber, result.Input, result.ExpectedOutput, result.ActualOutput, result.Error)
			} else if result.Error != nil {
				failureReason = fmt.Sprintf("Test case %d failed. Input: %s, Expected: %s, Got: %s with error: %v",
					result.TestNumber, result.Input, result.ExpectedOutput, result.ActualOutput, result.Error)
			} else {
				failureReason = fmt.Sprintf("Test case %d failed. Input: %s, Expected: %s, Got: %s",
					result.TestNumber, result.Input, result.ExpectedOutput, result.ActualOutput)
			}
			failedTestDetails = append(failedTestDetails, failureReason)
		}
	}

	// Generate summary
	summary := fmt.Sprintf("Passed %d out of %d test cases", passedTests, totalTests)
	if len(failedTestDetails) > 0 {
		summary += "\nFailed test details:\n" + strings.Join(failedTestDetails, "\n")
	}

	return passedTests, passedTests == totalTests, summary
}

func ExecuteCodeOnJudge0(client *http.Client, code, input, expectedOutput, judge0URL string) (string, error) {
	// Submit code
	token, err := submitCode(client, code, input, expectedOutput, judge0URL)
	if err != nil {
		return "", fmt.Errorf("submission failed: %v", err)
	}

	// Wait for and get result
	return waitForResult(client, token, judge0URL)
}

func submitCode(client *http.Client, code, input, expectedOutput, judge0URL string) (string, error) {
	payload := map[string]interface{}{
		"source_code":     code,
		"language_id":     50,
		"stdin":           input,
		"expected_output": expectedOutput,
	}

	jsonPayload, err := json.Marshal(payload)
	if err != nil {
		return "", fmt.Errorf("failed to marshal JSON: %v", err)
	}

	req, err := http.NewRequest("POST", judge0URL+"/submissions", bytes.NewBuffer(jsonPayload))
	if err != nil {
		return "", fmt.Errorf("failed to create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("failed to send request: %v", err)
	}
	defer resp.Body.Close()

	var response map[string]interface{}
	if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
		return "", fmt.Errorf("failed to decode response: %v", err)
	}

	token, ok := response["token"].(string)
	if !ok {
		return "", fmt.Errorf("invalid token in response")
	}

	return token, nil
}

func waitForResult(client *http.Client, token, judge0URL string) (string, error) {
	maxAttempts := 300 // Maximum number of attempts (300 seconds)
	for attempt := 0; attempt < maxAttempts; attempt++ {
		time.Sleep(time.Second) // Wait before checking result
		//fmt.Println(token)
		req, err := http.NewRequest("GET", judge0URL+"/submissions/"+token, nil)
		if err != nil {
			return "", err
		}

		resp, err := client.Do(req)
		if err != nil {
			return "", err
		}
		defer resp.Body.Close()

		var result SubmissionResult
		if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
			return "", err
		}

		switch result.Status.ID {
		case 1, 2: // In Queue or Processing
			continue
		case 3: // Accepted
			return result.Output, nil
		case 4:
			return result.Output, fmt.Errorf(result.Status.Description)
		default:
			return result.CompileOutput, fmt.Errorf("execution failed: %v", result.Status.Description)
		}
	}
	return "", fmt.Errorf("timeout waiting for result after %d seconds", maxAttempts)
}
