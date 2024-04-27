-- name: GetPopularFlights :many
SELECT f.departure_airport, f.arrival_airport, COUNT(s.seat_id) as seat_count
FROM flights f
JOIN flight_seats s ON f.flight_id = s.flight_id AND departure_datetime BETWEEN @start_date::string AND @end_date::string
GROUP BY f.departure_airport, f.arrival_airport
ORDER BY seat_count DESC
LIMIT @limit::int;

