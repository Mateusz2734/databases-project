-- name: CheckIfUnavailable :many
SELECT seat_id FROM flight_seats 
WHERE flight_id = @flight_id::int
AND seat_id = ANY(sqlc.slice('seat_ids')::int[]);

-- name: AddReservationSeats :copyfrom
INSERT INTO flight_seats (flight_id, reservation_id, seat_id)
VALUES (@flight_id::int, @reservation_id::int, @seat_id::int);

-- name: DeleteReservationSeats :exec
DELETE FROM flight_seats
WHERE reservation_id = @reservation_id::int
AND seat_id = ANY(sqlc.slice('seat_ids')::int[]);

-- name: DeleteAllReservationSeats :many
DELETE FROM flight_seats
WHERE reservation_id = @reservation_id::int
RETURNING seat_id::int;

-- name: GetReservationSeats :many
SELECT seat_type, row, col 
FROM flight_seats
JOIN seats ON flight_seats.seat_id = seats.seat_id
WHERE reservation_id = @reservation_id::int;

-- name: GetReservedSeatsForFlight :many
SELECT seats.row, seats.col FROM seats
JOIN flight_seats ON seats.seat_id = flight_seats.seat_id
WHERE flight_seats.flight_id = @flight_id;

-- name: GetSeatIDs :many
SELECT * FROM seats
WHERE row = ANY(sqlc.slice('rows'))
AND col = ANY(sqlc.slice('cols'))
AND airplane_id = @airplane_id;