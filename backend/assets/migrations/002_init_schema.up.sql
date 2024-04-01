CREATE OR REPLACE FUNCTION create_enum_type_if_not_exists(tname text, vals text[])
RETURNS void AS
$$
DECLARE
    exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = tname
    ) INTO exists;

    IF NOT exists THEN
        EXECUTE 'CREATE TYPE ' || tname || ' AS ENUM (' || array_to_string(vals, ', ') || ')';
    END IF;
END;
$$
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION add_foreign_key_if_not_exists(
    tname text,
    cname text,
    foreign_tname text,
    foreign_cname text
) RETURNS void AS
$$
DECLARE
    const_name text;
    constraint_exists boolean;
BEGIN
    const_name := tname || '_' || cname || '_fkey';

    SELECT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = const_name
    ) INTO constraint_exists;

    IF NOT constraint_exists THEN
        EXECUTE 'ALTER TABLE ' || tname || ' ADD CONSTRAINT ' ||
                const_name || ' FOREIGN KEY (' || cname || ') ' ||
                ' REFERENCES ' || foreign_tname || ' (' || foreign_cname || ')';
    END IF;
END;
$$ LANGUAGE plpgsql;

SELECT create_enum_type_if_not_exists('reservation_status', ARRAY['''pending''', '''confirmed''', '''cancelled''']);
SELECT create_enum_type_if_not_exists('availability', ARRAY['''available''', '''reserved''', '''unavailable''']);
SELECT create_enum_type_if_not_exists('seat_class', ARRAY['''economy''', '''business''', '''first_class''']);

CREATE TABLE IF NOT EXISTS "airports" (
  "airport_code" VARCHAR(3) PRIMARY KEY,
  "airport_name" VARCHAR(60) NOT NULL,
  "city" VARCHAR(70) NOT NULL,
  "country" VARCHAR(40) NOT NULL
);

CREATE TABLE IF NOT EXISTS "airplanes" (
  "airplane_id" INT PRIMARY KEY,
  "airplane_model" VARCHAR(100) NOT NULL,
  "diagram_metadata" JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS "flights" (
  "flight_id" INT PRIMARY KEY,
  "departure_airport" VARCHAR(3),
  "arrival_airport" VARCHAR(3),
  "departure_datetime" TIMESTAMP,
  "arrival_datetime" TIMESTAMP,
  "airplane_id" INT,
  "price" DECIMAL(10,2)
);

CREATE TABLE IF NOT EXISTS "customers" (
  "customer_id" INT PRIMARY KEY,
  "firstname" VARCHAR(50) NOT NULL,
  "lastname" VARCHAR(50) NOT NULL,
  "email" VARCHAR(100) NOT NULL,
  "phone" VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS "reservations" (
  "reservation_id" INT PRIMARY KEY,
  "flight_id" INT,
  "customer_id" INT,
  "seat_id" INT,
  "reservation_datetime" TIMESTAMP,
  "status" reservation_status
);

CREATE TABLE IF NOT EXISTS "seats_flights" (
  "seat_flight_id" INT PRIMARY KEY,
  "flight_id" INT,
  "seat_id" INT,
  "availability" availability DEFAULT 'available'
);

CREATE TABLE IF NOT EXISTS "seats" (
  "seat_id" INT PRIMARY KEY,
  "airplane_id" INT,
  "seat_number" VARCHAR(10) NOT NULL,
  "seat_type" seat_class
);

SELECT add_foreign_key_if_not_exists('flights', 'departure_airport', 'airports', 'airport_code');
SELECT add_foreign_key_if_not_exists('flights', 'arrival_airport', 'airports', 'airport_code');
SELECT add_foreign_key_if_not_exists('flights', 'airplane_id', 'airplanes', 'airplane_id');
SELECT add_foreign_key_if_not_exists('reservations', 'flight_id', 'flights', 'flight_id');
SELECT add_foreign_key_if_not_exists('reservations', 'customer_id', 'customers', 'customer_id');
SELECT add_foreign_key_if_not_exists('reservations', 'seat_id', 'seats', 'seat_id');
SELECT add_foreign_key_if_not_exists('seats_flights', 'seat_id', 'seats', 'seat_id');
SELECT add_foreign_key_if_not_exists('seats_flights', 'flight_id', 'flights', 'flight_id');
SELECT add_foreign_key_if_not_exists('seats', 'airplane_id', 'airplanes', 'airplane_id');
