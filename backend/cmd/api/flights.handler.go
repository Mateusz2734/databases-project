package main

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/Mateusz2734/databases-project/backend/internal/db"
	"github.com/Mateusz2734/databases-project/backend/internal/request"
	"github.com/Mateusz2734/databases-project/backend/internal/response"
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
	}

	plane, err = app.db.GetAirplaneById(r.Context(), flight.AirplaneID.Int32)

	if err != nil && err != pgx.ErrNoRows {
		app.serverError(w, r, err)
		return
	}

	reservedSeats, err := app.db.GetReservedSeatsForFlight(r.Context(), pgtype.Int4{Int32: flight.FlightID, Valid: true})

	if err != nil && err != pgx.ErrNoRows {
		app.serverError(w, r, err)
		return
	}

	err = response.JSON(w, http.StatusOK, map[string]interface{}{
		"flight":   flight,
		"plane":    plane,
		"reserved": reservedSeats,
	})

	if err != nil {
		app.serverError(w, r, err)
	}
}

func (app *application) createFlight(w http.ResponseWriter, r *http.Request) {
	var input struct {
		DepartureDatetime string `json:"departure_datetime"`
		ArrivalDatetime   string `json:"arrival_datetime"`
		DepartureAirport  string `json:"departure_airport"`
		ArrivalAirport    string `json:"arrival_airport"`
		AirplaneID        int32  `json:"airplane_id"`
		Price             string `json:"price"`
	}

	err := request.DecodeJSON(w, r, &input)

	if err != nil {
		app.badRequest(w, r, err)
		return
	}

	if len(input.DepartureAirport) != 3 || len(input.ArrivalAirport) != 3 {
		app.badRequest(w, r, fmt.Errorf("airport code must be 3 characters long"))
		return
	}

	if input.DepartureAirport == input.ArrivalAirport {
		app.badRequest(w, r, fmt.Errorf("departure and arrival airports are the same"))
		return
	}

	existing, err := app.db.CheckIfAirportsExist(r.Context(), []string{input.DepartureAirport, input.ArrivalAirport})

	if err != nil {
		app.serverError(w, r, err)
		return
	}

	if len(existing) != 2 {
		err = response.JSON(w, http.StatusNotFound, map[string]interface{}{
			"message": "At least one of the airports does not exist",
		})

		if err != nil {
			app.serverError(w, r, err)
			return
		}

		return
	}

	price := pgtype.Numeric{}
	depTime := pgtype.Timestamp{}
	arrTime := pgtype.Timestamp{}

	err = price.Scan(input.Price)

	if err != nil {
		app.badRequest(w, r, err)
		return
	}

	tmDep, err := time.Parse("2006-01-02 15:04", input.DepartureDatetime)

	if err != nil {
		app.badRequest(w, r, err)
		return
	}

	err = depTime.Scan(tmDep)

	if err != nil {
		app.badRequest(w, r, err)
		return
	}

	tmArr, err := time.Parse("2006-01-02 15:04", input.ArrivalDatetime)

	if err != nil {
		app.badRequest(w, r, err)
		return
	}

	if tmArr.Before(tmDep) {
		app.badRequest(w, r, fmt.Errorf("arrival time is before departure time"))
		return
	}

	err = arrTime.Scan(tmArr)

	if err != nil {
		app.badRequest(w, r, err)
		return
	}

	params := db.AddFlightParams{
		DepartureAirport:  input.DepartureAirport,
		ArrivalAirport:    input.ArrivalAirport,
		DepartureDatetime: depTime,
		ArrivalDatetime:   arrTime,
		AirplaneID:        input.AirplaneID,
		Price:             price,
	}

	err = app.db.AddFlight(r.Context(), params)

	if err != nil {
		app.serverError(w, r, err)
		return
	}

	err = response.JSON(w, http.StatusCreated, map[string]string{"message": "Flight created successfully"})

	if err != nil {
		app.serverError(w, r, err)
	}
}
