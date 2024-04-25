-- name: GetAirportsWithFilters :many
SELECT * FROM airports WHERE true 
    AND (city = @city OR NOT @filter_by_city::boolean)
    AND (country = @country OR NOT @filter_by_country::boolean);

-- name: GetAvailableCitiesWithCountries :many
SELECT DISTINCT city, country FROM airports where airport_code IN (
    SELECT arrival_airport FROM flights
    UNION ALL
    SELECT departure_airport FROM flights
);

-- name: CheckIfAirportsExist :many
SELECT airport_code FROM airports WHERE airport_code = ANY(sqlc.slice('airport_codes'));
