package main

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/Mateusz2734/databases-project/backend/internal/db"
	"github.com/Mateusz2734/databases-project/backend/internal/request"
	"github.com/Mateusz2734/databases-project/backend/internal/response"
	"github.com/Mateusz2734/databases-project/backend/internal/validator"
	"github.com/alexedwards/flow"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

func (app *application) getFlightData(w http.ResponseWriter, r *http.Request) {
	var flight db.Flight
	var plane db.Airplane

	flightId := flow.Param(r.Context(), "id")

	flightIdInt, err := strconv.ParseInt(flightId, 10, 32)
	if err != nil {
		app.badRequest(w, r, err)
		return
	}

	flight, err = app.db.GetFlightById(r.Context(), int32(flightIdInt))
	if err != nil && err != pgx.ErrNoRows {
		app.serverError(w, r, err)
		return
	} else if err == pgx.ErrNoRows {
		response.JSON(w, http.StatusNotFound, map[string]interface{}{"message": "Flight not found"})
		return
	}

	plane, err = app.db.GetAirplaneById(r.Context(), flight.AirplaneID.Int32)
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	reservedSeats, err := app.db.GetReservedSeatsForFlight(r.Context(), pgtype.Int4{Int32: flight.FlightID, Valid: true})
	if err != nil && err != pgx.ErrNoRows {
		app.serverError(w, r, err)
		return
	}

	data := map[string]interface{}{
		"flight":   flight,
		"plane":    plane,
		"reserved": reservedSeats,
	}

	if err = response.JSON(w, http.StatusOK, data); err != nil {
		app.serverError(w, r, err)
	}
}

func (app *application) createFlight(w http.ResponseWriter, r *http.Request) {
	var input struct {
		DepartureDatetime string `json:"departure_time"`
		ArrivalDatetime   string `json:"arrival_time"`
		DepartureAirport  string `json:"origin"`
		ArrivalAirport    string `json:"destination"`
		AirplaneID        int32  `json:"airplane_id"`
		Price             string `json:"price"`
	}

	if err := request.DecodeJSON(w, r, &input); err != nil {
		app.badRequest(w, r, err)
		return
	}

	if err := validator.ValidateAirports(input.DepartureAirport, input.ArrivalAirport); err != nil {
		app.badRequest(w, r, err)
		return
	}

	existingAirports, err := app.db.CheckIfAirportsExist(r.Context(), []string{input.DepartureAirport, input.ArrivalAirport})
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	if len(existingAirports) != 2 {
		response.JSON(w, http.StatusNotFound, map[string]interface{}{
			"message": "At least one of the airports does not exist",
		})
		return
	}

	departure, arrival, price, err := validator.ValidateCreateFlightParams(input.DepartureDatetime, input.ArrivalDatetime, input.Price)

	if err != nil {
		app.badRequest(w, r, err)
		return
	}

	params := db.AddFlightParams{
		DepartureAirport:  input.DepartureAirport,
		ArrivalAirport:    input.ArrivalAirport,
		DepartureDatetime: departure,
		ArrivalDatetime:   arrival,
		AirplaneID:        input.AirplaneID,
		Price:             price,
	}

	if err = app.db.AddFlight(r.Context(), params); err != nil {
		app.serverError(w, r, err)
		return
	}

	msg := map[string]string{"message": "Flight created successfully"}
	if err = response.JSON(w, http.StatusCreated, msg); err != nil {
		app.serverError(w, r, err)
	}
}

func (app *application) getFilteredFlights(w http.ResponseWriter, r *http.Request) {
	departureAirport := r.URL.Query().Get("origin")
	arrivalAirport := r.URL.Query().Get("destination")
	departureDatetime := r.URL.Query().Get("departure_time")
	arrivalDatetime := r.URL.Query().Get("arrival_time")
	minPrice := r.URL.Query().Get("min_price")
	maxPrice := r.URL.Query().Get("max_price")

	if err := validator.ValidateAirports(departureAirport, arrivalAirport); err != nil {
		app.badRequest(w, r, err)
		return
	}

	departure, arrival, min, max, err := validator.ValidateGetFilteredFlightsParams(departureDatetime, arrivalDatetime, minPrice, maxPrice)
	if err != nil {
		app.badRequest(w, r, err)
		return
	}

	filtered, err := app.db.GetFlightsWithFilters(r.Context(), db.GetFlightsWithFiltersParams{
		FromAirport:         departureAirport,
		FilterByFromAirport: departureAirport != "",

		ToAirport:         arrivalAirport,
		FilterByToAirport: arrivalAirport != "",

		DepartureDatetime:         departure,
		FilterByDepartureDatetime: departureDatetime != "",

		ArrivalDatetime:         arrival,
		FilterByArrivalDatetime: arrivalDatetime != "",

		MinPrice:      min,
		MaxPrice:      max,
		FilterByPrice: minPrice != "" && maxPrice != "",
	})

	if err != nil && err != pgx.ErrNoRows {
		app.serverError(w, r, err)
		return
	}

	if err == pgx.ErrNoRows || len(filtered) == 0 {
		response.JSON(w, http.StatusNotFound, map[string]interface{}{
			"message": "No flights found",
		})
		return
	}

	if err = response.JSON(w, http.StatusOK, filtered); err != nil {
		app.serverError(w, r, err)
	}
}

func (app *application) editFlight(w http.ResponseWriter, r *http.Request) {
	var input struct {
		DepartureDatetime string `json:"departure_time"`
		ArrivalDatetime   string `json:"arrival_time"`
		Price             string `json:"price"`
	}

	flightId := flow.Param(r.Context(), "id")
	if flightId == "" {
		app.badRequest(w, r, fmt.Errorf("flightID not provided"))
		return
	}

	if err := request.DecodeJSON(w, r, &input); err != nil {
		app.badRequest(w, r, err)
		return
	}

	flightIDint, err := strconv.ParseInt(flightId, 10, 32)
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

	flight, err := qtx.GetFlightById(r.Context(), int32(flightIDint))
	if err != nil && err != pgx.ErrNoRows {
		app.serverError(w, r, err)
		return
	}

	if err == pgx.ErrNoRows {
		response.JSON(w, http.StatusNotFound, map[string]interface{}{
			"message": "Flight not found",
		})
		return
	}

	departure, arrival, price, err := validator.ValidateEditFlightParams(flight, input.DepartureDatetime, input.ArrivalDatetime, input.Price)
	if err != nil {
		app.badRequest(w, r, err)
		return
	}

	params := db.UpdateFlightParams{
		DepartureDatetime: departure,
		ArrivalDatetime:   arrival,
		Price:             price,
		FlightID:          int32(flightIDint),
	}
	if err := app.db.UpdateFlight(r.Context(), params); err != nil {
		app.serverError(w, r, err)
		return
	}

	if err := tx.Commit(r.Context()); err != nil {
		app.serverError(w, r, err)
		return
	}

	msg := map[string]string{"message": "Flight updated successfully"}
	if err := response.JSON(w, http.StatusOK, msg); err != nil {
		app.serverError(w, r, err)
	}
}
