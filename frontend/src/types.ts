export type SeatTypeEarnings = {
  seat_type: string;
  value: number;
};

export type DestinationPopularity = {
  arrival_airport: string;
  seat_count: number;
};

export type RoutePopularity = {
  departure_airport: string;
  arrival_airport: string;
  seat_count: number;
};

export enum TableType {
  Route,
  Destination,
}

export type CountriesType = {
  [key: string]: string[];
};

export type AirportType = {
  airport_code: string,
  airport_name: string,
  city: string,
  country: string;
};

export type FlightType = {
  flight_id: string,
  departure_airport: string,
  arrival_airport: string,
  departure_datetime: string,
  arrival_datetime: string,
  airplane_id: number,
  price: number,
  departure_city: string,
  arrival_city: string;
};

export interface Reservation {
  reservation_id: number;
  flight_id: number;
  firstname: string;
  lastname: string;
  email: string;
  reservation_datetime: string;
  status: {
    reservation_status: string;
    valid: boolean;
  };
}

export type ReservationDetails = {
  reservation: Reservation;
  departure_airport: string;
  arrival_airport: string;
  departure_datetime: string;
};

export interface Flight {
  flight_id: number;
  departure_airport: string;
  arrival_airport: string;
  departure_datetime: string;
  arrival_datetime: string;
  airplane_id: number;
  price: number;
}

export interface Seat {
  seat_type: string;
  row: number;
  col: number;
}