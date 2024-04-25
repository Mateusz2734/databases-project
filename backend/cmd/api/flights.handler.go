package main

import (
	"net/http"
	"strconv"

	"github.com/Mateusz2734/databases-project/backend/internal/db"
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
