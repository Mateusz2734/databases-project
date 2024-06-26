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
    foreign_cname text,
    cascade boolean DEFAULT false
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
                ' REFERENCES ' || foreign_tname || ' (' || foreign_cname || ')' ||
                CASE WHEN cascade THEN ' ON DELETE CASCADE' ELSE '' END;
    END IF;
END;
$$ LANGUAGE plpgsql;

SELECT create_enum_type_if_not_exists('seat_class', ARRAY['''economy''', '''business''', '''first_class''', '''economy_plus''']);

CREATE TABLE IF NOT EXISTS "airports" (
  "airport_code" VARCHAR(3) PRIMARY KEY,
  "airport_name" VARCHAR(60) NOT NULL,
  "city" VARCHAR(70) NOT NULL,
  "country" VARCHAR(40) NOT NULL
);

CREATE TABLE IF NOT EXISTS "airplanes" (
  "airplane_id" SERIAL PRIMARY KEY,
  "airplane_model" VARCHAR(100) NOT NULL,
  "diagram_metadata" JSONB NOT NULL
);

CREATE TABLE IF NOT EXISTS "flights" (
  "flight_id" SERIAL PRIMARY KEY,
  "departure_airport" VARCHAR(3) NOT NULL,
  "arrival_airport" VARCHAR(3) NOT NULL,
  "departure_datetime" TIMESTAMP NOT NULL,
  "arrival_datetime" TIMESTAMP NOT NULL,
  "airplane_id" INT,
  "price" DECIMAL(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS "reservations" (
  "reservation_id" SERIAL PRIMARY KEY,
  "flight_id" INT,
  "firstname" VARCHAR(50) NOT NULL,
  "lastname" VARCHAR(50) NOT NULL,
  "email" VARCHAR(100) NOT NULL,
  "reservation_datetime" TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "flight_seats" (
  "id" SERIAL PRIMARY KEY,
  "flight_id" INT,
  "seat_id" INT,
  "created_at" TIMESTAMP DEFAULT NOW(),
  "reservation_id" INT
);

CREATE TABLE IF NOT EXISTS "seats" (
  "seat_id" SERIAL PRIMARY KEY,
  "airplane_id" INT,
  "seat_type" seat_class NOT NULL,
  "row" INT NOT NULL,
  "col" INT NOT NULL
);

CREATE TABLE IF NOT EXISTS "pricing" (
  "id" SERIAL PRIMARY KEY,
  "seat_class" seat_class NOT NULL,
  "value" DECIMAL(10,2) NOT NULL
);

SELECT add_foreign_key_if_not_exists('flights', 'departure_airport', 'airports', 'airport_code');
SELECT add_foreign_key_if_not_exists('flights', 'arrival_airport', 'airports', 'airport_code');
SELECT add_foreign_key_if_not_exists('flights', 'airplane_id', 'airplanes', 'airplane_id');
SELECT add_foreign_key_if_not_exists('reservations', 'flight_id', 'flights', 'flight_id', true);
SELECT add_foreign_key_if_not_exists('flight_seats', 'reservation_id', 'reservations', 'reservation_id');
SELECT add_foreign_key_if_not_exists('flight_seats', 'seat_id', 'seats', 'seat_id');
SELECT add_foreign_key_if_not_exists('flight_seats', 'flight_id', 'flights', 'flight_id', true);
SELECT add_foreign_key_if_not_exists('seats', 'airplane_id', 'airplanes', 'airplane_id');
