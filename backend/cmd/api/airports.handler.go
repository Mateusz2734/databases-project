package main

import (
	"net/http"

	"github.com/Mateusz2734/databases-project/backend/internal/db"
	"github.com/Mateusz2734/databases-project/backend/internal/response"
)

func (app *application) getFilteredAirports(w http.ResponseWriter, r *http.Request) {
	country := r.URL.Query().Get("country")
	city := r.URL.Query().Get("city")

	params := db.GetAirportsWithFiltersParams{
		Country:         country,
		FilterByCountry: country != "",
		City:            city,
		FilterByCity:    city != "",
	}

	airports, err := app.db.GetAirportsWithFilters(r.Context(), params)

	if err != nil {
		app.serverError(w, r, err)
	}

	if airports == nil {
		airports = []db.Airport{}
	}

	err = response.JSON(w, http.StatusOK, airports)

	if err != nil {
		app.serverError(w, r, err)
	}
}
