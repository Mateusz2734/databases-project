package main

import (
	"net/http"

	"github.com/Mateusz2734/databases-project/backend/internal/db"
	"github.com/Mateusz2734/databases-project/backend/internal/misc"
	"github.com/Mateusz2734/databases-project/backend/internal/request"
	"github.com/Mateusz2734/databases-project/backend/internal/response"
	"github.com/jackc/pgx/v5"
)

func (app *application) createReservation(w http.ResponseWriter, r *http.Request) {
	var err error
	var input struct {
		FlightID   int32              `json:"flight_id"`
		Firstname  string             `json:"firstname"`
		Lastname   string             `json:"lastname"`
		Email      string             `json:"email"`
		AirplaneID int32              `json:"airplane_id"`
		Seats      []db.SeatPlacement `json:"seats"`
	}

	err = request.DecodeJSON(w, r, &input)

	if err != nil {
		app.badRequest(w, r, err)
		return
	}

	rows, cols := misc.GetRowsAndCols(input.Seats)

	tx, err := app.db.BeginTx(r.Context(), pgx.TxOptions{})
	if err != nil {
		app.serverError(w, r, err)
		return
	}
	defer tx.Rollback(r.Context())

	qtx := app.db.WithTx(tx)

	allSeats, err := qtx.GetSeatIDs(r.Context(), db.GetSeatIDsParams{Rows: rows, Cols: cols, AirplaneID: input.AirplaneID})

	if err != nil && err != pgx.ErrNoRows {
		app.serverError(w, r, err)
		return
	}

	filteredSeats := misc.FilterSeats(allSeats, input.Seats)
	seatIDs := make([]int32, 0, len(filteredSeats))

	for _, seat := range filteredSeats {
		seatIDs = append(seatIDs, seat.SeatID)
	}

	unavailableIDs, err := qtx.CheckIfUnavailable(r.Context(), db.CheckIfUnavailableParams{SeatIds: seatIDs, FlightID: input.FlightID})

	unavailable := misc.FindUnavailable(unavailableIDs, allSeats)

	if err != nil {
		app.serverError(w, r, err)
		return
	}

	if len(unavailable) > 0 {
		err = response.JSONWithHeaders(w, http.StatusConflict, map[string]interface{}{
			"message": "Some seats are unavailable",
			"seats":   unavailable,
		}, nil)
		if err != nil {
			app.serverError(w, r, err)
		}
		return
	}

	reservation, err := qtx.AddReservation(r.Context(), db.AddReservationParams{
		FlightID:  input.FlightID,
		Firstname: input.Firstname,
		Lastname:  input.Lastname,
		Email:     input.Email,
		Status:    db.NullReservationStatus{ReservationStatus: db.ReservationStatusConfirmed, Valid: true},
	})

	if err != nil {
		app.serverError(w, r, err)
		return
	}

	params := make([]db.AddReservationSeatsParams, 0, len(seatIDs))

	for _, seatID := range seatIDs {
		params = append(params, db.AddReservationSeatsParams{ReservationID: reservation.ReservationID, SeatID: seatID})
	}

	_, err = qtx.AddReservationSeats(r.Context(), params)

	if err != nil {
		app.serverError(w, r, err)
		return
	}

	reserveParams := make([]db.ReserveFlightSeatsParams, 0, len(seatIDs))

	for _, seatID := range seatIDs {
		reserveParams = append(reserveParams, db.ReserveFlightSeatsParams{
			FlightID: input.FlightID,
			SeatID:   seatID,
			Availability: db.NullAvailability{
				Availability: db.AvailabilityReserved,
				Valid:        true,
			},
		})
	}

	_, err = qtx.ReserveFlightSeats(r.Context(), reserveParams)

	if err != nil {
		app.serverError(w, r, err)
		return
	}

	err = tx.Commit(r.Context())

	if err != nil {
		app.serverError(w, r, err)
		return
	}

	err = response.JSON(w, http.StatusCreated, reservation)
	if err != nil {
		app.serverError(w, r, err)
	}
}
