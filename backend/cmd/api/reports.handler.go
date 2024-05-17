package main

import (
	"net/http"
	"strconv"
	"time"

	"github.com/Mateusz2734/databases-project/backend/internal/db"
	"github.com/Mateusz2734/databases-project/backend/internal/response"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

func (app *application) getReports(w http.ResponseWriter, r *http.Request) {
	periodicEarnings := make([][2]float64, 0, 366)

	startDate := r.URL.Query().Get("from")
	endDate := r.URL.Query().Get("to")
	limit := r.URL.Query().Get("limit")

	start := pgtype.Date{}
	if err := start.Scan(startDate); err != nil {
		app.badRequest(w, r, err)
		return
	}

	end := pgtype.Date{}
	if err := end.Scan(endDate); err != nil {
		app.badRequest(w, r, err)
		return
	}

	limitInt, err := strconv.ParseInt(limit, 10, 32)
	if err != nil {
		app.badRequest(w, r, err)
		return
	}

	tx, err := app.db.BeginTx(r.Context(), pgx.TxOptions{AccessMode: pgx.ReadOnly})
	if err != nil {
		app.serverError(w, r, err)
		return
	}
	defer tx.Rollback(r.Context())

	args := db.GetPeriodicEarningsBetweenDatesParams{
		Type:      "day",
		StartDate: pgtype.Date{Time: time.Date(2024, time.January, 1, 0, 0, 0, 0, time.UTC), Valid: true},
		EndDate:   pgtype.Date{Time: time.Date(2025, time.January, 1, 0, 0, 0, 0, time.UTC), Valid: true},
	}
	earnings, err := app.db.GetPeriodicEarningsBetweenDates(r.Context(), tx, args)

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
		periodicEarnings = append(periodicEarnings, [2]float64{float64(e.PeriodStart.Time.UnixMilli()), float64(val.Float64)})
	}

	totalEarnings, err := app.db.GetTotalEarningsBetweenDates(r.Context(), tx, db.GetTotalEarningsBetweenDatesParams{StartDate: start, EndDate: end})
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	ticketsSold, err := app.db.GetTicketsSoldBetweenDates(r.Context(), tx, db.GetTicketsSoldBetweenDatesParams{StartDate: start, EndDate: end})
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	popularDestinations, err := app.db.GetPopularDestinations(r.Context(), tx, db.GetPopularDestinationsParams{StartDate: start, EndDate: end, CustomLimit: int32(limitInt)})
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	popularFlights, err := app.db.GetPopularFlights(r.Context(), tx, db.GetPopularFlightsParams{StartDate: start, EndDate: end, CustomLimit: int32(limitInt)})
	if err != nil {
		app.serverError(w, r, err)
		return
	}

	if err := tx.Commit(r.Context()); err != nil {
		app.serverError(w, r, err)
		return
	}

	data := map[string]interface{}{
		"periodic_earnings":    periodicEarnings,
		"total_earnings":       totalEarnings,
		"tickets_sold":         ticketsSold,
		"popular_destinations": popularDestinations,
		"popular_flights":      popularFlights,
	}
	response.JSON(w, http.StatusOK, data)
}
