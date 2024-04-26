package main

import (
	"net/http"

	"github.com/alexedwards/flow"
)

func (app *application) routes() http.Handler {
	mux := flow.New()

	mux.NotFound = http.HandlerFunc(app.notFound)
	mux.MethodNotAllowed = http.HandlerFunc(app.methodNotAllowed)

	mux.Use(app.enableCORS)
	mux.Use(app.logAccess)
	mux.Use(app.recoverPanic)

	mux.HandleFunc("/cities", app.getAvailableCities, "GET")

	mux.HandleFunc("/airports", app.getFilteredAirports, "GET")

	mux.HandleFunc("/flights/:id", app.getFlightData, "GET")
	mux.HandleFunc("/flights", app.createFlight, "POST")

	mux.HandleFunc("/reservations", app.createReservation, "POST")
	mux.HandleFunc("/reservations/:id", app.deleteReservation, "DELETE")
	mux.HandleFunc("/reservations/:id", app.editReservation, "PATCH")

	return mux
}
