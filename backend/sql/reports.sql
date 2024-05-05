-- name: GetPopularFlights :many
SELECT f.departure_airport, f.arrival_airport, COUNT(s.seat_id) as seat_count
FROM flights f
JOIN flight_seats s ON f.flight_id = s.flight_id AND departure_datetime BETWEEN @start_date::date AND @end_date::date
GROUP BY f.departure_airport, f.arrival_airport
ORDER BY seat_count DESC
LIMIT @custom_limit::int;

-- name: GetPopularDestinations :many
SELECT f.arrival_airport, COUNT(s.seat_id) as seat_count
FROM flights f
JOIN flight_seats s ON f.flight_id = s.flight_id AND departure_datetime BETWEEN @start_date::date AND @end_date::date
GROUP BY f.arrival_airport
ORDER BY seat_count DESC
LIMIT @custom_limit::int;

-- name: GetTicketsSoldBetweenDates :one
SELECT COUNT(seat_id) as seat_count
FROM flight_seats
WHERE created_at BETWEEN @start_date::date AND @end_date::date;

-- name: GetTotalEarningsBetweenDates :many
SELECT s.seat_type, 
       SUM(f.price * p.value)::numeric AS value
FROM seats s 
INNER JOIN flight_seats fs ON s.seat_id = fs.seat_id 
INNER JOIN flights f ON fs.flight_id = f.flight_id 
INNER JOIN pricing p ON s.seat_type = p.seat_class
WHERE fs.created_at BETWEEN @start_date::date AND @end_date::date
GROUP BY s.seat_type;

-- name: GetPeriodicEarningsBetweenDates :many
SELECT 
        GREATEST(DATE_TRUNC(@type, created_at), @start_date)::date AS period_start,
        SUM(f.price * p.value)::numeric AS earnings
FROM seats s 
INNER JOIN flight_seats fs ON s.seat_id = fs.seat_id
INNER JOIN flights f ON fs.flight_id = f.flight_id 
INNER JOIN pricing p ON s.seat_type = p.seat_class
WHERE created_at BETWEEN @start_date AND @end_date::date
GROUP BY period_start
ORDER BY period_start ASC;