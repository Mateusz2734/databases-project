package main

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/Mateusz2734/databases-project/backend/internal/db"
	"github.com/Mateusz2734/databases-project/backend/internal/misc"
	"github.com/Mateusz2734/databases-project/backend/internal/request"
	"github.com/Mateusz2734/databases-project/backend/internal/response"
	"github.com/Mateusz2734/databases-project/backend/internal/validator"
	"github.com/alexedwards/flow"
	"github.com/jackc/pgx/v5"
)

func (app *application) createReservation(w http.ResponseWriter, r *http.Request) {
	var input struct {
		FlightID  int32               `json:"flight_id"`
		Firstname string              `json:"firstname"`
		Lastname  string              `json:"lastname"`
		Email     string              `json:"email"`
		Seats     []db.SeatPlacement  `json:"seats"`
		Validator validator.Validator `json:"-"`
	}

	if err := request.DecodeJSON(w, r, &input); err != nil {
		app.badRequest(w, r, err)
		return
	}

	input.Validator.Check(input.FlightID != 0, "Missing flight_id")
	input.Validator.Check(input.Firstname != "", "Missing firstname")
	input.Validator.Check(input.Lastname != "", "Missing lastname")
	input.Validator.Check(input.Email != "", "Missing email")
	input.Validator.Check(len(input.Seats) > 0, "Missing seats")

	if input.Validator.HasErrors() {
		app.failedValidation(w, r, input.Validator)
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

	flight, err := qtx.GetFlightById(r.Context(), input.FlightID)
	if err != nil && err != pgx.ErrNoRows {
		app.serverError(w, r, err)
		return
	}

	if flight.FlightID == 0 {
		msg := map[string]string{"message": "Flight does not exist"}
		response.JSON(w, http.StatusNotFound, msg)
		return
	}

	if flight.DepartureDatetime.Time.Before(time.Now()) {
		msg := map[string]string{"message": "Flight has already departed"}
		response.JSON(w, http.StatusConflict, msg)
		return
	}

	allSeats, err := qtx.GetSeatIDs(r.Context(), db.GetSeatIDsParams{Rows: rows, Cols: cols, AirplaneID: flight.AirplaneID.Int32})
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
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	unavailableSeats := misc.FindUnavailable(unavailableIDs, allSeats)
	if len(unavailableSeats) > 0 {
		data := map[string]interface{}{
			"message": "Some seats are unavailable",
			"seats":   unavailableSeats,
		}
		if err = response.JSON(w, http.StatusConflict, data); err != nil {
			app.serverError(w, r, err)
		}
		return
	}

	params1 := db.AddReservationParams{
		FlightID:  input.FlightID,
		Firstname: input.Firstname,
		Lastname:  input.Lastname,
		Email:     input.Email,
		Status: db.NullReservationStatus{
			ReservationStatus: db.ReservationStatusConfirmed,
			Valid:             true,
		},
	}
	reservation, err := qtx.AddReservation(r.Context(), params1)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	seatsParams := make([]db.AddReservationSeatsParams, 0, len(seatIDs))
	for _, seatID := range seatIDs {
		seatsParams = append(seatsParams, db.AddReservationSeatsParams{ReservationID: reservation.ReservationID, SeatID: seatID})
	}

	_, err = qtx.AddReservationSeats(r.Context(), seatsParams)
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

	if err = tx.Commit(r.Context()); err != nil {
		app.serverError(w, r, err)
		return
	}

	if err = response.JSON(w, http.StatusCreated, reservation); err != nil {
		app.serverError(w, r, err)
	}
}

// Removes some seats from reservation
func (app *application) editReservation(w http.ResponseWriter, r *http.Request) {
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

	if err = request.DecodeJSON(w, r, &input); err != nil {
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

	data, err := qtx.GetReservationByID(r.Context(), int32(reservationIDint))
	reservation := data.Reservation

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
	if err != nil {
		app.serverError(w, r, err)
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

	params1 := db.DeleteReservationSeatsParams{ReservationID: int32(reservationIDint), SeatIds: seatIDs}
	if err = qtx.DeleteReservationSeats(r.Context(), params1); err != nil {
		app.serverError(w, r, err)
		return
	}

	params2 := db.DeleteFlightSeatsParams{SeatIds: seatIDs, FlightID: reservation.FlightID.Int32}
	if err = qtx.DeleteFlightSeats(r.Context(), params2); err != nil {
		app.serverError(w, r, err)
		return
	}

	if err = tx.Commit(r.Context()); err != nil {
		app.serverError(w, r, err)
		return
	}

	msg := map[string]string{"message": "Seats removed from reservation"}
	if err = response.JSON(w, http.StatusOK, msg); err != nil {
		app.serverError(w, r, err)
	}
}

func (app *application) deleteReservation(w http.ResponseWriter, r *http.Request) {
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

	data, err := qtx.GetReservationByID(r.Context(), int32(reservationIDint))
	if err != nil && err != pgx.ErrNoRows {
		app.serverError(w, r, err)
		return
	}
	reservation := data.Reservation

	if reservation.ReservationID == 0 {
		msg := map[string]string{"message": "Reservation not found"}
		response.JSON(w, http.StatusNotFound, msg)
		return
	}

	deleted, err := qtx.DeleteAllReservationSeats(r.Context(), reservation.ReservationID)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	params := db.DeleteFlightSeatsParams{SeatIds: deleted, FlightID: reservation.FlightID.Int32}
	if err = qtx.DeleteFlightSeats(r.Context(), params); err != nil {
		app.serverError(w, r, err)
		return
	}

	if err = qtx.DeleteReservation(r.Context(), reservation.ReservationID); err != nil {
		app.serverError(w, r, err)
		return
	}

	if err = tx.Commit(r.Context()); err != nil {
		app.serverError(w, r, err)
		return
	}

	msg := map[string]string{"message": "Reservation deleted"}
	if err = response.JSON(w, http.StatusOK, msg); err != nil {
		app.serverError(w, r, err)
	}
}

func (app *application) getReservation(w http.ResponseWriter, r *http.Request) {
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

	reservation, err := app.db.GetReservationByID(r.Context(), int32(reservationIDint))
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	if reservation.Reservation.ReservationID == 0 {
		response.JSON(w, http.StatusNotFound, map[string]interface{}{"message": "Reservation not found"})
		return
	}

	seats, err := app.db.GetReservationSeats(r.Context(), reservation.Reservation.ReservationID)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	data := map[string]interface{}{
		"reservation": reservation.Reservation,
		"flight":      reservation.Flight,
		"seats":       seats,
	}
	if err = response.JSON(w, http.StatusOK, data); err != nil {
		app.serverError(w, r, err)
	}
}

func (app *application) getClientReservations(w http.ResponseWriter, r *http.Request) {
	val := validator.Validator{}

	email := r.URL.Query().Get("email")
	firstname := r.URL.Query().Get("firstname")
	lastname := r.URL.Query().Get("lastname")

	val.Check(email != "", "Missing email")
	val.Check(firstname != "", "Missing firstname")
	val.Check(lastname != "", "Missing lastname")

	if val.HasErrors() {
		app.failedValidation(w, r, val)
		return
	}

	params := db.GetCustomerReservationsParams{
		Email:     email,
		Firstname: firstname,
		Lastname:  lastname,
	}
	reservations, err := app.db.GetCustomerReservations(r.Context(), params)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	if len(reservations) == 0 {
		reservations = []db.GetCustomerReservationsRow{}
	}

	data := map[string]interface{}{
		"reservations": reservations,
	}
	if err = response.JSON(w, http.StatusOK, data); err != nil {
		app.serverError(w, r, err)
	}
}
