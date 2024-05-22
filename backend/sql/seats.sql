-- name: GetReservedSeatsForFlight :many
SELECT seats.row, seats.col FROM seats
JOIN flight_seats ON seats.seat_id = flight_seats.seat_id
WHERE flight_seats.flight_id = @flight_id;

-- name: CheckIfUnavailable :many
SELECT seat_id FROM flight_seats 
WHERE flight_id = @flight_id::int
AND seat_id = ANY(sqlc.slice('seat_ids')::int[]);

-- name: GetSeatIDs :many
SELECT * FROM seats
WHERE row = ANY(sqlc.slice('rows'))
AND col = ANY(sqlc.slice('cols'))
AND airplane_id = @airplane_id;

-- name: ReserveFlightSeats :copyfrom
INSERT INTO flight_seats (flight_id, seat_id) VALUES (@flight_id::int, @seat_id::int);

-- name: DeleteFlightSeats :exec
DELETE FROM flight_seats 
WHERE flight_id = @flight_id::int
AND seat_id = ANY(sqlc.slice('seat_ids')::int[]);

-- name: DeleteAllFlightSeats :many
DELETE FROM flight_seats 
WHERE flight_id = @flight_id::int
RETURNING flight_seats.seat_id::int;

-- name: GetReservationSeats :many
SELECT seat_type, row, col 
FROM flight_seats
JOIN seats ON flight_seats.seat_id = seats.seat_id
WHERE reservation_id = @reservation_id::int;