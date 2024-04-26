package misc

import (
	"github.com/Mateusz2734/databases-project/backend/internal/db"
	"github.com/jackc/pgx/v5/pgtype"
)

func GetCountryCities(entries []db.GetAvailableCitiesWithCountriesRow) map[string][]string {
	countryCities := make(map[string][]string, len(entries))

	for _, entry := range entries {
		if _, ok := countryCities[entry.Country]; !ok {
			countryCities[entry.Country] = []string{}
		}

		countryCities[entry.Country] = append(countryCities[entry.Country], entry.City)
	}

	return countryCities
}

func GetRowsAndCols(seats []db.SeatPlacement) ([]int32, []int32) {
	rows := make(map[int32]struct{}, len(seats))
	cols := make(map[int32]struct{}, len(seats))

	for _, seat := range seats {
		rows[seat.Row] = struct{}{}
		cols[seat.Col] = struct{}{}
	}

	rowsSlice := make([]int32, 0, len(rows))
	for row := range rows {
		rowsSlice = append(rowsSlice, row)
	}

	colsSlice := make([]int32, 0, len(cols))
	for col := range cols {
		colsSlice = append(colsSlice, col)
	}

	return rowsSlice, colsSlice
}

func FilterSeats(seats []db.Seat, places []db.SeatPlacement) []db.Seat {
	filteredSeats := make([]db.Seat, 0, len(seats))

	for _, seat := range seats {
		for _, place := range places {
			if seat.Row == place.Row && seat.Col == place.Col {
				filteredSeats = append(filteredSeats, seat)
				break
			}
		}
	}

	return filteredSeats
}

func FindUnavailable(unavailableIDs []pgtype.Int4, seats []db.Seat) []db.SeatPlacement {
	unavailableSeatIDs := make(map[int32]struct{}, len(unavailableIDs))

	for _, seat := range unavailableIDs {
		unavailableSeatIDs[seat.Int32] = struct{}{}
	}

	filteredSeats := make([]db.SeatPlacement, 0, len(seats))

	for _, seat := range seats {
		if _, ok := unavailableSeatIDs[seat.SeatID]; ok {
			filteredSeats = append(filteredSeats, db.SeatPlacement{Col: seat.Col, Row: seat.Row})
		}
	}

	return filteredSeats
}
