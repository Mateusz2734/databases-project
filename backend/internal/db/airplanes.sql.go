// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.26.0
// source: airplanes.sql

package db

import (
	"context"
)

const getAirplaneById = `-- name: GetAirplaneById :one
SELECT airplane_id, airplane_model, diagram_metadata FROM airplanes 
    WHERE airplane_id = $1
`

func (q *Queries) GetAirplaneById(ctx context.Context, airplaneID int32) (Airplane, error) {
	row := q.db.QueryRow(ctx, getAirplaneById, airplaneID)
	var i Airplane
	err := row.Scan(&i.AirplaneID, &i.AirplaneModel, &i.DiagramMetadata)
	return i, err
}
