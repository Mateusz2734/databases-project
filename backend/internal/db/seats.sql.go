// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.26.0
// source: seats.sql

package db

import (
	"context"

	"github.com/jackc/pgx/v5/pgtype"
)

type AddReservationSeatsParams struct {
	FlightID      int32 `json:"flight_id"`
	ReservationID int32 `json:"reservation_id"`
	SeatID        int32 `json:"seat_id"`
}

const checkIfUnavailable = `-- name: CheckIfUnavailable :many
SELECT seat_id FROM flight_seats 
WHERE flight_id = $1::int
AND seat_id = ANY($2::int[])
`

type CheckIfUnavailableParams struct {
	FlightID int32   `json:"flight_id"`
	SeatIds  []int32 `json:"seat_ids"`
}

func (q *Queries) CheckIfUnavailable(ctx context.Context, db DBTX, arg CheckIfUnavailableParams) ([]pgtype.Int4, error) {
	rows, err := db.Query(ctx, checkIfUnavailable, arg.FlightID, arg.SeatIds)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []pgtype.Int4
	for rows.Next() {
		var seat_id pgtype.Int4
		if err := rows.Scan(&seat_id); err != nil {
			return nil, err
		}
		items = append(items, seat_id)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const deleteAllReservationSeats = `-- name: DeleteAllReservationSeats :many
DELETE FROM flight_seats
WHERE reservation_id = $1::int
RETURNING seat_id::int
`

func (q *Queries) DeleteAllReservationSeats(ctx context.Context, db DBTX, reservationID int32) ([]int32, error) {
	rows, err := db.Query(ctx, deleteAllReservationSeats, reservationID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []int32
	for rows.Next() {
		var seat_id int32
		if err := rows.Scan(&seat_id); err != nil {
			return nil, err
		}
		items = append(items, seat_id)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const deleteReservationSeats = `-- name: DeleteReservationSeats :exec
DELETE FROM flight_seats
WHERE reservation_id = $1::int
AND seat_id = ANY($2::int[])
`

type DeleteReservationSeatsParams struct {
	ReservationID int32   `json:"reservation_id"`
	SeatIds       []int32 `json:"seat_ids"`
}

func (q *Queries) DeleteReservationSeats(ctx context.Context, db DBTX, arg DeleteReservationSeatsParams) error {
	_, err := db.Exec(ctx, deleteReservationSeats, arg.ReservationID, arg.SeatIds)
	return err
}

const getReservationSeats = `-- name: GetReservationSeats :many
SELECT seat_type, row, col 
FROM flight_seats
JOIN seats ON flight_seats.seat_id = seats.seat_id
WHERE reservation_id = $1::int
`

type GetReservationSeatsRow struct {
	SeatType SeatClass `json:"seat_type"`
	Row      int32     `json:"row"`
	Col      int32     `json:"col"`
}

func (q *Queries) GetReservationSeats(ctx context.Context, db DBTX, reservationID int32) ([]GetReservationSeatsRow, error) {
	rows, err := db.Query(ctx, getReservationSeats, reservationID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []GetReservationSeatsRow
	for rows.Next() {
		var i GetReservationSeatsRow
		if err := rows.Scan(&i.SeatType, &i.Row, &i.Col); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getReservedSeatsForFlight = `-- name: GetReservedSeatsForFlight :many
SELECT seats.row, seats.col FROM seats
JOIN flight_seats ON seats.seat_id = flight_seats.seat_id
WHERE flight_seats.flight_id = $1
`

type GetReservedSeatsForFlightRow struct {
	Row int32 `json:"row"`
	Col int32 `json:"col"`
}

func (q *Queries) GetReservedSeatsForFlight(ctx context.Context, db DBTX, flightID pgtype.Int4) ([]GetReservedSeatsForFlightRow, error) {
	rows, err := db.Query(ctx, getReservedSeatsForFlight, flightID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []GetReservedSeatsForFlightRow
	for rows.Next() {
		var i GetReservedSeatsForFlightRow
		if err := rows.Scan(&i.Row, &i.Col); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const getSeatIDs = `-- name: GetSeatIDs :many
SELECT seat_id, airplane_id, seat_type, row, col FROM seats
WHERE row = ANY($1)
AND col = ANY($2)
AND airplane_id = $3
`

type GetSeatIDsParams struct {
	Rows       []int32 `json:"rows"`
	Cols       []int32 `json:"cols"`
	AirplaneID int32   `json:"airplane_id"`
}

func (q *Queries) GetSeatIDs(ctx context.Context, db DBTX, arg GetSeatIDsParams) ([]Seat, error) {
	rows, err := db.Query(ctx, getSeatIDs, arg.Rows, arg.Cols, arg.AirplaneID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []Seat
	for rows.Next() {
		var i Seat
		if err := rows.Scan(
			&i.SeatID,
			&i.AirplaneID,
			&i.SeatType,
			&i.Row,
			&i.Col,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}
