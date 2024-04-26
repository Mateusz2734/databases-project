-- name: GetCustomerReservations :many
SELECT sqlc.embed(reservations), 
    flights.departure_airport, 
    flights.arrival_airport,
    flights.departure_datetime
FROM reservations
JOIN flights ON reservations.flight_id = flights.flight_id
WHERE email = @email 
AND @firstname = firstname 
AND @lastname = lastname
AND flights.departure_datetime > NOW();

-- name: AddReservation :one
INSERT INTO reservations (flight_id, firstname, lastname, email, reservation_datetime, status)
VALUES (@flight_id::int, @firstname, @lastname, @email, NOW(), @status)
RETURNING *;

-- name: GetReservationByID :one
SELECT sqlc.embed(reservations), sqlc.embed(flights)
FROM reservations 
JOIN flights ON reservations.flight_id = flights.flight_id
WHERE reservation_id = @reservation_id::int;

-- name: DeleteReservation :exec
DELETE FROM reservations WHERE reservation_id = @reservation_id::int;