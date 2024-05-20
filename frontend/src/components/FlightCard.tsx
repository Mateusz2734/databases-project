import { Link } from 'react-router-dom';

import { FlightType } from '../types';

export function FlightCard(flight: FlightType) {
    return (
        <Link key={flight.flight_id}
            to={`/flight/${flight.flight_id}`}
            className="flight">
            <div className="origin">{flight.departure_city} ({flight.departure_airport})</div>
            <div className="destination">{flight.arrival_city} ({flight.arrival_airport})</div>
            <div className="date-time">{formatDateAndTime(flight.departure_datetime)}</div>
            <div
                className="duration">Duration: {calculateFlightDuration(flight.departure_datetime, flight.arrival_datetime)}</div>
            <div className="basic-price">Price: {flight.price}</div>
        </Link>
    );
};

const formatDateAndTime = (dateTime: string) => {
    const date = new Date(dateTime);
    const day = date.toLocaleString('en-us', { weekday: 'long' });
    const formattedDate = date.toLocaleDateString('en-GB');
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const formattedTime = `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}`;
    return `${day}, ${formattedDate}, ${formattedTime}`;
};

const calculateFlightDuration = (departureDateTime: string, arrivalDateTime: string) => {
    const departureTime = new Date(departureDateTime).getTime();
    const arrivalTime = new Date(arrivalDateTime).getTime();
    const durationInMilliseconds = arrivalTime - departureTime;
    const hours = Math.floor(durationInMilliseconds / (1000 * 60 * 60));
    const minutes = Math.floor((durationInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
};