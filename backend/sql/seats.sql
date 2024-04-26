-- name: GetReservedSeatsForFlight :many
SELECT seats.row, seats.col FROM seats
JOIN flight_seats ON seats.seat_id = flight_seats.seat_id
WHERE flight_seats.flight_id = @flight_id
AND flight_seats.availability IN ('reserved', 'unavailable');

-- name: CheckIfUnavailable :many
SELECT seat_id FROM flight_seats 
WHERE flight_id = @flight_id::int
AND seat_id = ANY(sqlc.slice('seat_ids')::int[]) 
AND availability != 'available';

-- name: GetSeatIDs :many
SELECT * FROM seats
WHERE row = ANY(sqlc.slice('rows'))
AND col = ANY(sqlc.slice('cols'))
AND airplane_id = @airplane_id;

-- name: AddReservationSeats :copyfrom
INSERT INTO reservation_seats (reservation_id, seat_id) VALUES (@reservation_id::int, @seat_id::int);

-- name: ReserveFlightSeats :copyfrom
INSERT INTO flight_seats (flight_id, seat_id, availability) VALUES (@flight_id::int, @seat_id::int, @availability);

-- name: DeleteReservationSeats :exec
DELETE FROM reservation_seats 
WHERE reservation_id = @reservation_id 
AND seat_id = ANY(sqlc.slice('seat_ids'));

-- name: DeleteFlightSeats :exec
DELETE FROM flight_seats 
WHERE flight_id = @flight_id
AND seat_id = ANY(sqlc.slice('seat_ids'));