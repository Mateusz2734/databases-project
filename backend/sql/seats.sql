-- name: GetReservedSeatsForFlight :many
SELECT seats.* FROM seats
JOIN flight_seats ON seats.seat_id = flight_seats.seat_id
WHERE flight_seats.flight_id = @flight_id
AND flight_seats.availability IN ('reserved', 'unavailable');