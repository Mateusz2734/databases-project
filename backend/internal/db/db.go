package db

import (
	"context"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
)

const defaultTimeout = 3 * time.Second

type DB struct {
	*Queries
	*pgxpool.Pool
}

func NewDB(dsn string) (*DB, error) {
	ctx, cancel := context.WithTimeout(context.Background(), defaultTimeout)
	defer cancel()

	pool, err := pgxpool.New(ctx, dsn)
	if err != nil {
		return nil, err
	}

	db := New()

	return &DB{db, pool}, nil
}
