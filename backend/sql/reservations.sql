-- name: GetCustomerReservations :many
SELECT * FROM reservations 
    WHERE email = @email 
    AND @firstname = firstname 
    AND @lastname = lastname;