-- name: GetReservedSeatsForFlight :many
SELECT seats.* FROM seats
JOIN flight_seats ON seats.seat_id = flight_seats.seat_id
WHERE flight_seats.flight_id = @flight_id
AND flight_seats.availability IN ('reserved', 'unavailable');

-- name: CheckIfUnavailable :many
SELECT seat_id FROM flight_seats 
WHERE flight_id = @flight_id
AND seat_id IN (sqlc.slice('seat_ids')) 
AND availability != 'available';

-- name: AddReservationSeats :copyfrom
INSERT INTO reservation_seats (reservation_id, seat_id) VALUES (@reservation_id, @seat_id);

-- name: ReserveFlightSeats :copyfrom
INSERT INTO flight_seats (flight_id, seat_id, availability) VALUES (@flight_id, @seat_id, @availability);

-- name: DeleteReservationSeats :exec
DELETE FROM reservation_seats 
WHERE reservation_id = @reservation_id 
AND seat_id IN (sqlc.slice('seat_ids'));

-- name: DeleteFlightSeats :exec
DELETE FROM flight_seats 
WHERE flight_id = @flight_id
AND seat_id IN (sqlc.slice('seat_ids'));