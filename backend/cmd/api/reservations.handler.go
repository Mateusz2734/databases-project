package main

import (
	"context"
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

	flight, err := app.db.GetFlightById(r.Context(), tx, input.FlightID)
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

	allSeats, err := app.db.GetSeatIDs(r.Context(), tx, db.GetSeatIDsParams{Rows: rows, Cols: cols, AirplaneID: flight.AirplaneID.Int32})
	if err != nil && err != pgx.ErrNoRows {
		app.serverError(w, r, err)
		return
	}

	filteredSeats := misc.FilterSeats(allSeats, input.Seats)
	seatIDs := make([]int32, 0, len(filteredSeats))

	for _, seat := range filteredSeats {
		seatIDs = append(seatIDs, seat.SeatID)
	}

	if len(seatIDs) != len(input.Seats) {
		msg := map[string]string{"message": "Some seats do not exist"}
		response.JSON(w, http.StatusNotFound, msg)
		return
	}

	unavailableIDs, err := app.db.CheckIfUnavailable(r.Context(), tx, db.CheckIfUnavailableParams{SeatIds: seatIDs, FlightID: input.FlightID})
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

	params := db.AddReservationParams{
		FlightID:  input.FlightID,
		Firstname: input.Firstname,
		Lastname:  input.Lastname,
		Email:     input.Email,
	}
	reservation, err := app.db.AddReservation(r.Context(), tx, params)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	seatsParams := make([]db.AddReservationSeatsParams, 0, len(seatIDs))
	for _, seatID := range seatIDs {
		seatsParams = append(seatsParams, db.AddReservationSeatsParams{ReservationID: reservation.ReservationID, FlightID: flight.FlightID, SeatID: seatID})
	}

	_, err = app.db.AddReservationSeats(r.Context(), tx, seatsParams)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	if err = tx.Commit(r.Context()); err != nil {
		app.serverError(w, r, err)
		return
	}

	data := map[string]interface{}{
		"message":     "Reservation created",
		"reservation": reservation,
	}
	if err = response.JSON(w, http.StatusCreated, data); err != nil {
		app.serverError(w, r, err)
	}
}

func (app *application) editReservation(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Seats     []db.SeatPlacement  `json:"seats"`
		Type      string              `json:"type"`
		validator validator.Validator `json:"-"`
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

	input.validator.Check(input.Type == "add" || input.Type == "remove", "Invalid operation type")
	input.validator.Check(len(input.Seats) > 0, "Missing seats")

	if input.validator.HasErrors() {
		app.failedValidation(w, r, input.validator)
		return
	}

	rows, cols := misc.GetRowsAndCols(input.Seats)

	tx, err := app.db.BeginTx(r.Context(), pgx.TxOptions{})
	if err != nil {
		app.serverError(w, r, err)
		return
	}
	defer tx.Rollback(r.Context())

	data, err := app.db.GetReservationByID(r.Context(), tx, int32(reservationIDint))
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

	flight, err := app.db.GetFlightById(r.Context(), tx, reservation.FlightID.Int32)
	if err != nil {
		app.notFound(w, r)
		return
	}

	input.validator.Clear()
	input.validator.Check(flight.DepartureDatetime.Time.After(time.Now()), "Flight has already departed")

	if input.validator.HasErrors() {
		app.failedValidation(w, r, input.validator)
		return
	}

	allSeats, err := app.db.GetSeatIDs(r.Context(), tx, db.GetSeatIDsParams{Rows: rows, Cols: cols, AirplaneID: flight.AirplaneID.Int32})
	if err != nil && err != pgx.ErrNoRows {
		app.serverError(w, r, err)
		return
	}

	filteredSeats := misc.FilterSeats(allSeats, input.Seats)
	seatIDs := make([]int32, 0, len(filteredSeats))

	for _, seat := range filteredSeats {
		seatIDs = append(seatIDs, seat.SeatID)
	}

	if len(seatIDs) != len(input.Seats) {
		msg := map[string]string{"message": "Some seats do not exist"}
		response.JSON(w, http.StatusNotFound, msg)
		return
	}

	var code int
	var message string
	if input.Type == "add" {
		code, err = app.addSeats(r.Context(), &tx, reservation.ReservationID, reservation.FlightID.Int32, seatIDs, allSeats)
		message = "Seats added to reservation"
	} else {
		code, err = app.deleteSeats(r.Context(), &tx, reservation.ReservationID, seatIDs)
		message = "Seats removed from reservation"
	}

	if err != nil {
		app.errorMessage(w, r, code, err.Error(), nil)
		return
	}

	if err = tx.Commit(r.Context()); err != nil {
		app.serverError(w, r, err)
		return
	}

	msg := map[string]string{"message": message}
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

	data, err := app.db.GetReservationByID(r.Context(), tx, int32(reservationIDint))
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

	_, err = app.db.DeleteAllReservationSeats(r.Context(), tx, reservation.ReservationID)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	if err = app.db.DeleteReservation(r.Context(), tx, reservation.ReservationID); err != nil {
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

	reservation, err := app.db.GetReservationByID(r.Context(), app.db.Pool, int32(reservationIDint))
	if err != nil && err != pgx.ErrNoRows {
		app.serverError(w, r, err)
		return
	}

	if reservation.Reservation.ReservationID == 0 {
		response.JSON(w, http.StatusNotFound, map[string]interface{}{"message": "Reservation not found"})
		return
	}

	seats, err := app.db.GetReservationSeats(r.Context(), app.db.Pool, reservation.Reservation.ReservationID)
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
	reservations, err := app.db.GetCustomerReservations(r.Context(), app.db.Pool, params)
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

func (app *application) deleteSeats(ctx context.Context, tx *pgx.Tx, reservationID int32, seatIDs []int32) (int, error) {
	params := db.DeleteReservationSeatsParams{ReservationID: reservationID, SeatIds: seatIDs}
	if err := app.db.DeleteReservationSeats(ctx, *tx, params); err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusOK, nil
}

func (app *application) addSeats(ctx context.Context, tx *pgx.Tx, reservationID, flightID int32, seatIDs []int32, allSeats []db.Seat) (int, error) {
	unavailableIDs, err := app.db.CheckIfUnavailable(ctx, *tx, db.CheckIfUnavailableParams{SeatIds: seatIDs, FlightID: flightID})
	if err != nil {
		return http.StatusInternalServerError, err
	}

	unavailableSeats := misc.FindUnavailable(unavailableIDs, allSeats)

	if len(unavailableSeats) > 0 {
		return http.StatusConflict, fmt.Errorf("some seats are unavailable")
	}

	seatsParams := make([]db.AddReservationSeatsParams, 0, len(seatIDs))
	for _, seatID := range seatIDs {
		seatsParams = append(seatsParams, db.AddReservationSeatsParams{ReservationID: reservationID, FlightID: flightID, SeatID: seatID})
	}

	_, err = app.db.AddReservationSeats(ctx, *tx, seatsParams)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusOK, nil
}
