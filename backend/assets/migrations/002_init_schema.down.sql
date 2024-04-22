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
SELECT drop_fk_if_exists('seats', 'airplane_id');
SELECT drop_fk_if_exists('reservation_seats', 'reservation_id');
SELECT drop_fk_if_exists('reservation_seats', 'seat_id');


-- Drop tables
DROP TABLE IF EXISTS "reservation_seats";
DROP TABLE IF EXISTS "reservations";
DROP TABLE IF EXISTS "flight_seats";
DROP TABLE IF EXISTS "flights";
DROP TABLE IF EXISTS "seats";
DROP TABLE IF EXISTS "airports";
DROP TABLE IF EXISTS "airplanes";
DROP TABLE IF EXISTS "customers";

-- Drop enums
SELECT drop_type_if_exists('seat_class');
SELECT drop_type_if_exists('reservation_status');
SELECT drop_type_if_exists('availability');
