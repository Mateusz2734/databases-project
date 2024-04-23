-- name: GetCustomerReservations :many
SELECT * FROM reservations 
    WHERE email = @email 
    AND @firstname = firstname 
    AND @lastname = lastname;

-- name: AddReservation :one
INSERT INTO reservations (flight_id, firstname, lastname, email, reservation_datetime, status)
VALUES (@flight_id, @firstname, @lastname, @email, NOW(), @status)
RETURNING *;