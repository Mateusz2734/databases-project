-- name: GetAirplaneById :one
SELECT * FROM airplanes 
    WHERE airplane_id = @airplane_id;