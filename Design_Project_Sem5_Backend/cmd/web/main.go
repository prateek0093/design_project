package main

import (
	"DesignProjectBackend/drivers"
	"DesignProjectBackend/handlers"
	"database/sql"
	"fmt"
	"net/http"
)

const portnumber = ":8080"

func main() {

	fmt.Println("Connecting to Database")
	db, err := drivers.ConnectSQL("host=localhost port=5432 dbname=DesignProject user=yash password=123")
	if err != nil {
		fmt.Println(err)
		return
	}
	defer func(SQL *sql.DB) {
		err := SQL.Close()
		if err != nil {
			fmt.Println("Error closing SQL", err)
			return
		}
	}(db.SQL)
	err = db.SQL.Ping()
	if err != nil {
		fmt.Println("Error in Pinging database", err)
		return
	}
	fmt.Println("Connected to Database in main.go")

	Repo := handlers.NewRepo(db)
	handlers.NewHandler(Repo)
	fmt.Println("server started on port " + portnumber)
	srv := http.Server{
		Addr:    portnumber,
		Handler: routes(),
	}

	err = srv.ListenAndServe()
	if err != nil {
		fmt.Println(err)
		return
	}
}
