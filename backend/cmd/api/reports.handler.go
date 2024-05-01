package main

import (
	"net/http"
	"time"

	"github.com/Mateusz2734/databases-project/backend/internal/db"
	"github.com/Mateusz2734/databases-project/backend/internal/response"
	"github.com/jackc/pgx/v5/pgtype"
)

func (app *application) getReports(w http.ResponseWriter, r *http.Request) {
	data := make([][2]float64, 0)

	start := pgtype.Date{Time: time.Date(2024, time.January, 1, 0, 0, 0, 0, time.UTC), Valid: true}
	end := pgtype.Date{Time: time.Date(2024, time.December, 31, 0, 0, 0, 0, time.UTC), Valid: true}

	args := db.GetPeriodicEarningsBetweenDatesParams{
		Type:      "day",
		StartDate: start,
		EndDate:   end,
	}
	earnings, err := app.db.GetPeriodicEarningsBetweenDates(r.Context(), args)

	if err != nil {
		app.serverError(w, r, err)
		return
	}

	for _, e := range earnings {
		val, err := e.Earnings.Float64Value()

		if err != nil {
			app.serverError(w, r, err)
			return
		}
		data = append(data, [2]float64{float64(e.PeriodStart.Time.UnixMilli()), float64(val.Float64)})
	}

	response.JSON(w, http.StatusOK, data)
}
