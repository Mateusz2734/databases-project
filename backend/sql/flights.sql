-- name: GetFlightsWithFilters :many
SELECT f.*
FROM flights AS f
JOIN airports AS a ON a.airport_code = f.departure_airport
    AND (a.airport_code = @from_airport OR NOT @filter_by_from_airport :: boolean)
JOIN airports AS a2 ON a2.airport_code = f.arrival_airport
    AND (a2.airport_code = @to_airport OR NOT @filter_by_to_airport :: boolean)
WHERE true 
    AND (date_part('day', f.departure_datetime) = date_part('day', @departure_datetime::timestamp) OR NOT @filter_by_departure_datetime::boolean)
    AND (date_part('day', f.arrival_datetime) = date_part('day', @arrival_datetime::timestamp) OR NOT @filter_by_arrival_datetime::boolean)
    AND (f.price BETWEEN @min_price AND @max_price OR NOT @filter_by_price::boolean);

-- name: AddFlight :exec
INSERT INTO flights (departure_airport, arrival_airport, departure_datetime, arrival_datetime, airplane_id, price)
VALUES (@departure_airport, @arrival_airport, @departure_datetime, @arrival_datetime, @airplane_id::int, @price);

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