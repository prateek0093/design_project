package drivers

import (
	"database/sql"
	"fmt"
	_ "github.com/jackc/pgx/v5/pgconn"
	_ "github.com/jackc/pgx/v5/stdlib"
	"time"
)

type DB struct {
	SQL *sql.DB
}

var DBConn = &DB{}

const maxOpenDbConnection = 25
const maxIdleDbConnection = 5
const maxLifetimeDbConnection = 30 * time.Minute
const maxRetries = 3
const connectTimeout = 10

func ConnectSQL(dsn string) (*DB, error) {
	db, err := NewDatabase(dsn)
	if err != nil {
		fmt.Println("Error in creating new Database", err)
		return nil, err
	}
	db.SetConnMaxLifetime(maxLifetimeDbConnection)
	db.SetMaxOpenConns(maxOpenDbConnection)
	db.SetMaxIdleConns(maxIdleDbConnection)
	DBConn.SQL = db
	err = db.Ping()
	if err != nil {
		return nil, err
	}
	return DBConn, nil
}

func NewDatabase(dsn string) (*sql.DB, error) {
	db, err := sql.Open("pgx", dsn)
	if err != nil {
		fmt.Println("Error opening database connection:", err)
		return nil, err
	}
	err = db.Ping()
	if err != nil {
		fmt.Println("Error pinging database connection:", err)
		return nil, err
	}
	return db, err
}
