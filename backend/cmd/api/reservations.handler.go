package main

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/Mateusz2734/databases-project/backend/internal/db"
	"github.com/Mateusz2734/databases-project/backend/internal/misc"
	"github.com/Mateusz2734/databases-project/backend/internal/request"
	"github.com/Mateusz2734/databases-project/backend/internal/response"
	"github.com/alexedwards/flow"
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

// Removes some seats from reservation
func (app *application) editReservation(w http.ResponseWriter, r *http.Request) {
	var err error
	var input struct {
		Seats []db.SeatPlacement `json:"seats"`
	}

	reservationID := flow.Param(r.Context(), "id")

	if reservationID == "" {
		app.badRequest(w, r, fmt.Errorf("missing reservation id"))
		return
	}

	reservationIDint, err := strconv.ParseInt(reservationID, 10, 32)

	if err != nil {
		app.badRequest(w, r, err)
		return
	}

	err = request.DecodeJSON(w, r, &input)

	if err != nil {
		app.badRequest(w, r, err)
		return
	}

	if len(input.Seats) == 0 {
		app.badRequest(w, r, fmt.Errorf("missing seats"))
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

	reservation, err := qtx.GetReservationByID(r.Context(), int32(reservationIDint))

	if err != nil && err != pgx.ErrNoRows {
		app.serverError(w, r, err)
		return
	}

	if reservation.ReservationID == 0 {
		err = response.JSON(w, http.StatusNotFound, nil)
		if err != nil {
			app.serverError(w, r, err)
		}
		return
	}

	reservationFlight, err := qtx.GetFlightById(r.Context(), reservation.FlightID.Int32)

	if err != nil && err != pgx.ErrNoRows {
		app.serverError(w, r, err)
		return
	}

	if reservationFlight.FlightID == 0 {
		err = response.JSON(w, http.StatusNotFound, nil)
		if err != nil {
			app.serverError(w, r, err)
		}
		return
	}

	allSeats, err := qtx.GetSeatIDs(r.Context(), db.GetSeatIDsParams{Rows: rows, Cols: cols, AirplaneID: reservationFlight.AirplaneID.Int32})

	if err != nil && err != pgx.ErrNoRows {
		app.serverError(w, r, err)
		return
	}

	filteredSeats := misc.FilterSeats(allSeats, input.Seats)
	seatIDs := make([]int32, 0, len(filteredSeats))

	for _, seat := range filteredSeats {
		seatIDs = append(seatIDs, seat.SeatID)
	}

	fmt.Println(seatIDs)

	err = qtx.DeleteReservationSeats(r.Context(), db.DeleteReservationSeatsParams{ReservationID: int32(reservationIDint), SeatIds: seatIDs})

	if err != nil {
		app.serverError(w, r, err)
		return
	}

	err = qtx.DeleteFlightSeats(r.Context(), db.DeleteFlightSeatsParams{SeatIds: seatIDs, FlightID: reservation.FlightID.Int32})

	if err != nil {
		app.serverError(w, r, err)
		return
	}

	err = tx.Commit(r.Context())

	if err != nil {
		app.serverError(w, r, err)
		return
	}

	err = response.JSON(w, http.StatusOK, map[string]interface{}{"message": "Seats removed from reservation"})
	if err != nil {
		app.serverError(w, r, err)
	}
}

func (app *application) deleteReservation(w http.ResponseWriter, r *http.Request) {
	var err error

	reservationID := flow.Param(r.Context(), "id")

	if reservationID == "" {
		app.badRequest(w, r, fmt.Errorf("missing reservation id"))
		return
	}

	reservationIDint, err := strconv.ParseInt(reservationID, 10, 32)

	if err != nil {
		app.badRequest(w, r, err)
		return
	}

	tx, err := app.db.BeginTx(r.Context(), pgx.TxOptions{})
	if err != nil {
		app.serverError(w, r, err)
		return
	}
	defer tx.Rollback(r.Context())

	qtx := app.db.WithTx(tx)

	reservation, err := qtx.GetReservationByID(r.Context(), int32(reservationIDint))

	if err != nil && err != pgx.ErrNoRows {
		app.serverError(w, r, err)
		return
	}

	if reservation.ReservationID == 0 {
		err = response.JSON(w, http.StatusNotFound, map[string]interface{}{"message": "Reservation not found"})
		if err != nil {
			app.serverError(w, r, err)
		}
		return
	}

	deleted, err := qtx.DeleteAllReservationSeats(r.Context(), reservation.ReservationID)

	if err != nil {
		app.serverError(w, r, err)
		return
	}

	err = qtx.DeleteFlightSeats(r.Context(), db.DeleteFlightSeatsParams{SeatIds: deleted, FlightID: reservation.FlightID.Int32})

	if err != nil {
		app.serverError(w, r, err)
		return
	}

	err = qtx.DeleteReservation(r.Context(), reservation.ReservationID)

	if err != nil {
		app.serverError(w, r, err)
		return
	}

	err = tx.Commit(r.Context())

	if err != nil {
		app.serverError(w, r, err)
		return
	}

	err = response.JSON(w, http.StatusOK, map[string]interface{}{"message": "Reservation deleted"})
	if err != nil {
		app.serverError(w, r, err)
	}
}
