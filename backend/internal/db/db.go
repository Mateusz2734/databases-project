package db

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

const defaultTimeout = 3 * time.Second

type DB struct {
	*Queries
	*pgx.Conn
}

func NewDB(dsn string) (*DB, error) {
	ctx, cancel := context.WithTimeout(context.Background(), defaultTimeout)
	defer cancel()

	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		return nil, err
	}

	defer pool.Close()

	conn, err := pgx.Connect(ctx, dsn)

	if err != nil {
		return nil, err
	}

	db := New(conn)

	return &DB{db, conn}, nil
}
