package validator

import (
	"fmt"

	"github.com/Mateusz2734/databases-project/backend/internal/db"
	"github.com/jackc/pgx/v5/pgtype"
)

func ValidateEditFlightParams(flight db.Flight, departureDatetime, arrivalDatetime, priceStr string) (pgtype.Timestamp, pgtype.Timestamp, pgtype.Numeric, error) {
	departure := pgtype.Timestamp{}
	arrival := pgtype.Timestamp{}
	price := pgtype.Numeric{}

	if departureDatetime != "" {
		if err := departure.Scan(departureDatetime); err != nil {
			return departure, arrival, price, err
		}
	} else {
		departure = flight.DepartureDatetime
	}

	if arrivalDatetime != "" {
		if err := arrival.Scan(arrivalDatetime); err != nil {
			return departure, arrival, price, err
		}
	} else {
		arrival = flight.ArrivalDatetime
	}

	if priceStr != "" {
		if err := price.Scan(priceStr); err != nil {
			return departure, arrival, price, err
		}
	} else {
		price = flight.Price
	}

	return departure, arrival, price, nil
}

func ValidateAirports(departure, arrival string) error {
	if departure != "" && arrival != "" {
		if len(departure) != 3 || len(arrival) != 3 {
			return fmt.Errorf("airport code must be 3 characters long")
		}

		if departure == arrival {
			return fmt.Errorf("departure and arrival airports are the same")
		}

		return nil
	} else if departure != "" {
		if len(departure) != 3 {
			return fmt.Errorf("airport code must be 3 characters long")
		}
	} else if arrival != "" {
		if len(arrival) != 3 {
			return fmt.Errorf("airport code must be 3 characters long")
		}
	}

	return nil
}

func ValidateCreateFlightParams(departureDatetime, arrivalDatetime, priceStr string) (pgtype.Timestamp, pgtype.Timestamp, pgtype.Numeric, error) {
	price := pgtype.Numeric{}
	departure := pgtype.Timestamp{}
	arrival := pgtype.Timestamp{}

	if err := price.Scan(priceStr); err != nil {
		return departure, arrival, price, err
	}

	if err := departure.Scan(departureDatetime); err != nil {
		return departure, arrival, price, err
	}

	if err := arrival.Scan(arrivalDatetime); err != nil {
		return departure, arrival, price, err
	}

	if arrival.Time.Before(departure.Time) {
		return departure, arrival, price, fmt.Errorf("arrival time is before departure time")
	}

	return departure, arrival, price, nil
}

func ValidateGetFilteredFlightsParams(departureDatetime, arrivalDatetime, minPrice, maxPrice string) (pgtype.Timestamp, pgtype.Timestamp, pgtype.Numeric, pgtype.Numeric, error) {
	departure := pgtype.Timestamp{}
	arrival := pgtype.Timestamp{}
	min := pgtype.Numeric{}
	max := pgtype.Numeric{}

	if departureDatetime != "" {
		if err := departure.Scan(departureDatetime); err != nil {
			return departure, arrival, min, max, err
		}
	}

	if arrivalDatetime != "" {
		if err := arrival.Scan(arrivalDatetime); err != nil {
			return departure, arrival, min, max, err
		}
	}

	if arrivalDatetime != "" && departureDatetime != "" && arrival.Time.Before(departure.Time) {
		return departure, arrival, min, max, fmt.Errorf("arrival time is before departure time")
	}

	if minPrice != "" {
		if err := min.Scan(minPrice); err != nil {
			return departure, arrival, min, max, err
		}
	}

	if maxPrice != "" {
		if err := max.Scan(maxPrice); err != nil {
			return departure, arrival, min, max, err
		}
	}

	if (minPrice != "" && maxPrice == "") || (minPrice == "" && maxPrice != "") {
		return departure, arrival, min, max, fmt.Errorf("both min and max price must be provided")
	}

	minFloat, _ := min.Float64Value()
	maxFloat, _ := max.Float64Value()

	if minPrice != "" && maxPrice != "" && minFloat.Float64 > maxFloat.Float64 {
		return departure, arrival, min, max, fmt.Errorf("min price is greater than max price")
	}

	return departure, arrival, min, max, nil
}
