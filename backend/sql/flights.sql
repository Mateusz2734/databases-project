-- name: GetFlightsWithFilters :many
SELECT f.*
FROM flights AS f
JOIN airports AS a ON a.airport_code = f.departure_airport
    AND (a.city = @from_city OR NOT @filter_by_from_city :: boolean)
JOIN airports AS a2 ON a2.airport_code = f.arrival_airport
    AND (a2.city = @to_city OR NOT @filter_by_to_city :: boolean)
WHERE true 
    AND (f.departure_datetime = @departure_datetime OR @departure_datetime IS NULL)
    AND (f.arrival_datetime = @arrival_datetime OR @arrival_datetime IS NULL)
    AND (f.price BETWEEN @min_price AND @max_price OR NOT @filter_by_price :: boolean);

-- name: AddFlight :exec
INSERT INTO flights (departure_airport, arrival_airport, departure_datetime, arrival_datetime, airplane_id, price)
VALUES (@departure_airport, @arrival_airport, @departure_datetime, @arrival_datetime, @airplane_id, @price);

-- name: GetFlightById :one
SELECT f.*
FROM flights AS f
WHERE f.flight_id = @flight_id;

-- name: DeleteFlight :exec
DELETE FROM flights
WHERE flight_id = @flight_id;

-- name: UpdateFlight :exec
UPDATE flights
SET departure_datetime = @departure_datetime, arrival_datetime = @arrival_datetime, price = @price
WHERE flight_id = @flight_id;