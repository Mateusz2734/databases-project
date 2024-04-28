DO $$
BEGIN
	IF (SELECT COUNT(*) FROM pricing) = 0 THEN
		INSERT INTO pricing (seat_class, value) VALUES
            ('economy', 1),
            ('economy_plus', 1.2),
            ('business', 2),
            ('first_class', 3.5);
	END IF;
END;
$$
LANGUAGE plpgsql;