import { Options } from 'seatchart';

import { FlightData, SeatType } from '../types';

export function columnLabeler(col: number) {
  const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  return letters[col % letters.length];
};

export function rowLabeler(row: number) {
  return (row + 1).toString();
};

export function getSeatTypeMultiplier(label: string) {
  switch (label) {
    case 'Business':
      return 2;
    case 'First Class':
      return 3.5;
    case 'Economy Plus':
      return 1.2;
    default:
      return 1;
  }
}

export function getFlightSeatOptions(flightData: FlightData | undefined): Options {
  return flightData
    ? {
      cart: { currency: "PLN" },
      map: {
        rows: flightData.plane.diagram_metadata.rows,
        columns: flightData.plane.diagram_metadata.columns,
        seatTypes: Object.entries(flightData.plane.diagram_metadata.seatTypes).reduce((acc, [key, value]) => {
          const seatType = value as SeatType;
          const multiplier = getSeatTypeMultiplier(seatType.label);

          acc[key] = {
            label: seatType.label,
            cssClass: seatType.cssClass,
            price: parseFloat((flightData.flight.price * multiplier).toFixed(2)),
            seatRows: seatType.seatRows,
          };

          return acc;
        }, {} as any),
        reservedSeats: flightData.reserved,
        rowSpacers: flightData.plane.diagram_metadata.rowSpacers,
        columnSpacers: flightData.plane.diagram_metadata.columnSpacers,
        disabledSeats: flightData.plane.diagram_metadata.disabledSeats,
        indexerColumns: { label: columnLabeler },
        indexerRows: { label: rowLabeler },
      }
    }
    : {
      map: {
        rows: 0,
        columns: 0,
        seatTypes: {
          default: {
            label: 'Default',
            cssClass: 'default',
            price: 0,
          },
        },
        reservedSeats: [],
        rowSpacers: [],
        columnSpacers: [],
      }
    };
}