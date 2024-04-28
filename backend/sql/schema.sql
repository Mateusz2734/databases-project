CREATE TYPE "reservation_status" AS ENUM (
  'pending',
  'confirmed',
  'cancelled'
);

CREATE TYPE "seat_class" AS ENUM (
  'economy',
  'business',
  'first_class',
  'economy_plus'
);

CREATE TABLE "airports" (
  "airport_code" VARCHAR(3) PRIMARY KEY,
  "airport_name" VARCHAR(60) NOT NULL,
  "city" VARCHAR(70) NOT NULL,
  "country" VARCHAR(40) NOT NULL
);

CREATE TABLE "airplanes" (
  "airplane_id" SERIAL PRIMARY KEY,
  "airplane_model" VARCHAR(100) NOT NULL,
  "diagram_metadata" JSONB NOT NULL
);

CREATE TABLE "flights" (
  "flight_id" SERIAL PRIMARY KEY,
  "departure_airport" VARCHAR(3) NOT NULL,
  "arrival_airport" VARCHAR(3) NOT NULL,
  "departure_datetime" TIMESTAMP NOT NULL,
  "arrival_datetime" TIMESTAMP,
  "airplane_id" INT,
  "price" DECIMAL(10,2) NOT NULL
);

CREATE TABLE "reservations" (
  "reservation_id" SERIAL PRIMARY KEY,
  "flight_id" INT,
  "firstname" VARCHAR(50) NOT NULL,
  "lastname" VARCHAR(50) NOT NULL,
  "email" VARCHAR(100) NOT NULL,
  "reservation_datetime" TIMESTAMP,
  "status" reservation_status
);

CREATE TABLE "flight_seats" (
  "id" SERIAL PRIMARY KEY,
  "flight_id" INT,
  "seat_id" INT,
  "created_at" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE "seats" (
  "seat_id" SERIAL PRIMARY KEY,
  "airplane_id" INT NOT NULL,
  "seat_type" seat_class NOT NULL,
  "row" INT NOT NULL,
  "col" INT NOT NULL
);

CREATE TABLE "reservation_seats" (
  "id" SERIAL PRIMARY KEY,
  "reservation_id" INT,
  "seat_id" INT
);

CREATE TABLE "pricing" (
  "id" SERIAL PRIMARY KEY,
  "seat_class" seat_class NOT NULL,
  "value" DECIMAL(10,2) NOT NULL
);

ALTER TABLE "reservation_seats" ADD FOREIGN KEY ("reservation_id") REFERENCES "reservations" ("reservation_id");

ALTER TABLE "reservation_seats" ADD FOREIGN KEY ("seat_id") REFERENCES "seats" ("seat_id");

ALTER TABLE "flights" ADD FOREIGN KEY ("arrival_airport") REFERENCES "airports" ("airport_code");

ALTER TABLE "flights" ADD FOREIGN KEY ("departure_airport") REFERENCES "airports" ("airport_code");

ALTER TABLE "flight_seats" ADD FOREIGN KEY ("flight_id") REFERENCES "flights" ("flight_id");

ALTER TABLE "flight_seats" ADD FOREIGN KEY ("seat_id") REFERENCES "seats" ("seat_id");

ALTER TABLE "seats" ADD FOREIGN KEY ("airplane_id") REFERENCES "airplanes" ("airplane_id");

ALTER TABLE "reservations" ADD FOREIGN KEY ("flight_id") REFERENCES "flights" ("flight_id");

ALTER TABLE "flights" ADD FOREIGN KEY ("airplane_id") REFERENCES "airplanes" ("airplane_id");
