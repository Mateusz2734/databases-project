-- name: GetAirports :many
SELECT * FROM airports;

-- name: GetAirportsWithFilters :many
SELECT * FROM airports WHERE true 
    AND (city = @city OR NOT @filter_by_city::boolean)
    AND (country = @country OR NOT @filter_by_country::boolean);

-- name: GetCities :many
SELECT DISTINCT city FROM airports;

-- name: GetCountries :many
SELECT DISTINCT country FROM airports;