package helpers

import (
	"bytes"
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync"
	"time"
)

func ValidateCodeAgainstTestCases(code string, testCasesFile []byte, judge0_url string) (bool, string) {
	// Parse the CSV
	reader := csv.NewReader(bytes.NewReader(testCasesFile))
	testCases, err := reader.ReadAll()
	if err != nil {
		fmt.Println("Error parsing CSV file:", err)
		return false, "CSV parsing error"
	}

	// Channel for errors
	errors := make(chan string, len(testCases))
	var wg sync.WaitGroup

	// Iterate over test cases concurrently
	for i, testCase := range testCases {
		if i == 0 {
			continue // Skip header
		}
		input := testCase[0]
		expectedOutput := testCase[1]

		wg.Add(1)
		go func(input, expectedOutput string) {
			defer wg.Done()
			// Send code to Judge0 for execution
			actualOutput, err := executeCodeOnJudge0(code, input, expectedOutput, judge0_url)
			if err != nil || strings.TrimSpace(actualOutput) != strings.TrimSpace(expectedOutput) {
				errors <- fmt.Sprintf("Input: %s, Expected: %s, Got: %s", input, expectedOutput, actualOutput)
			}
		}(input, expectedOutput)
	}

	// Wait for all goroutines to finish
	wg.Wait()
	close(errors)

	// Collect errors
	if len(errors) > 0 {
		return false, <-errors
	}

	return true, ""
}
func executeCodeOnJudge0(code, input, expected_output, judge0_url string) (string, error) {
	submissionPayload := map[string]interface{}{
		"source_code":     code,
		"language_id":     1, // Language ID for C
		"stdin":           input,
		"expected_output": expected_output,
	}

	jsonPayload, _ := json.Marshal(submissionPayload)
	//fmt.Println(string(jsonPayload))
	//fmt.Println(jsonPayload)
	judge0URL := judge0_url + "/submissions"

	req, err := http.NewRequest("POST", judge0URL, bytes.NewBuffer(jsonPayload))
	if err != nil {
		fmt.Println("error sending post request", err)
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	//req.Header.Set("X-Auth-Token", os.Getenv("JUDGE0_API_TOKEN"))

	client := &http.Client{}
	res, err := client.Do(req)
	if err != nil {
		fmt.Println("error sending post request", err)
		return "", err
	}
	defer func(Body io.ReadCloser) {
		err := Body.Close()
		if err != nil {
			return
		}
	}(res.Body)

	var response map[string]interface{}
	err = json.NewDecoder(res.Body).Decode(&response)
	if err != nil {
		fmt.Println("Error decoding json", err)
		return "", err
	}

	token := response["token"].(string)
	//fmt.Println("token:", token)
	return fetchExecutionResult(token, judge0_url)
}

func fetchExecutionResult(token, judge0_url string) (string, error) {
	time.Sleep(1 * time.Second)
	judge0URL := judge0_url + "/submissions/" + token
	//fmt.Println(judge0URL)
	client := &http.Client{}
	req, _ := http.NewRequest("GET", judge0URL, nil)
	//req.Header.Set("X-Auth-Token", os.Getenv("JUDGE0_API_TOKEN"))

	res, err := client.Do(req)
	if err != nil {
		fmt.Println("error sending get request", err)
		return "", err
	}
	defer func(Body io.ReadCloser) {
		err := Body.Close()
		if err != nil {
			fmt.Println(err)
			return
		}
	}(res.Body)

	var result struct {
		Output string `json:"stdout"`
		Error  string `json:"stderr"`
		Status struct {
			Id          int    `json:"id"`
			Description string `json:"description"`
		} `json:"status"`
	}

	err = json.NewDecoder(res.Body).Decode(&result)
	if err != nil {
		fmt.Println(err)
		return "", err
	}
	//fmt.Println(result)
	if result.Status.Id == 2 || result.Status.Id == 1 {
		return fetchExecutionResult(token, judge0_url)
	}
	if result.Status.Id == 3 || result.Status.Description == "Accepted" {
		return result.Output, nil
	}

	return result.Output, fmt.Errorf("execution failed: %v", result.Error)
}
