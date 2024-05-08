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