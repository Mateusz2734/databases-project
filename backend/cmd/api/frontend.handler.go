package main

import (
	"net/http"

	"github.com/Mateusz2734/databases-project/backend/internal/misc"
	"github.com/Mateusz2734/databases-project/backend/internal/response"
)

func (app *application) getAvailableCities(w http.ResponseWriter, r *http.Request) {
	entries, err := app.db.GetAvailableCitiesWithCountries(r.Context())

	if err != nil {
		app.serverError(w, r, err)
	}

	countryCities := misc.GetCountryCities(entries)

	err = response.JSON(w, http.StatusOK, countryCities)

	if err != nil {
		app.serverError(w, r, err)
	}
}
