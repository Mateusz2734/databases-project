CREATE OR REPLACE FUNCTION drop_fk_if_exists(tname text, cname text)
RETURNS void AS
$$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name = tname AND constraint_name = cname
    ) THEN
        EXECUTE 'ALTER TABLE ' || tname || ' DROP CONSTRAINT ' || cname;
    END IF;
END;
$$
LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION drop_type_if_exists(tname text)
RETURNS void AS
$$
DECLARE
    exists boolean;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM pg_type WHERE typname = tname
    ) INTO exists;

    IF exists THEN
        EXECUTE 'DROP TYPE ' || tname;
    END IF;
END;
$$
LANGUAGE plpgsql;

-- Drop foreign key constraints
SELECT drop_fk_if_exists('flights', 'departure_airport');
SELECT drop_fk_if_exists('flights', 'arrival_airport');
SELECT drop_fk_if_exists('flights', 'airplane_id');
SELECT drop_fk_if_exists('reservations', 'flight_id');
SELECT drop_fk_if_exists('flight_seats', 'seat_id');
SELECT drop_fk_if_exists('flight_seats', 'flight_id');
SELECT drop_fk_if_exists('flight_seats', 'reservation_id');
SELECT drop_fk_if_exists('seats', 'airplane_id');

-- Drop tables
DROP TABLE IF EXISTS "flight_seats" CASCADE;
DROP TABLE IF EXISTS "flights" CASCADE;
DROP TABLE IF EXISTS "seats" CASCADE;
DROP TABLE IF EXISTS "airports" CASCADE;
DROP TABLE IF EXISTS "airplanes" CASCADE;
DROP TABLE IF EXISTS "reservations" CASCADE;
DROP TABLE IF EXISTS "pricing" CASCADE;

-- Drop enums
SELECT drop_type_if_exists('seat_class');