package dbrepo

import (
	"DesignProjectBackend/database"
	"database/sql"
)

type PostgresRepo struct {
	DB *sql.DB
}

func NewPostgresRepo(conn *sql.DB) database.DatabaseRepo {
	return &PostgresRepo{
		DB: conn,
	}
}
