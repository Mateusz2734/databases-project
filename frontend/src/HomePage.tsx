import React from 'react';
import { Link } from 'react-router-dom';
import './css/HomePage.css';

const HomePage: React.FC = () => {
    const flights = [
        {
            id: 1,
            FlightID: 'ABC123',
            DepartureAirport: 'Warszawa',
            ArrivalAirport: 'Nowy Jork',
            DepartureDateTime: '2024-05-01T08:00:00',
            ArrivalDateTime: '2024-05-01T15:00:00',
            AirplaneID: 'BOEING747',
        },
        {
            id: 2,
            FlightID: 'DEF456',
            DepartureAirport: 'Kraków',
            ArrivalAirport: 'Paryż',
            DepartureDateTime: '2024-05-02T10:00:00',
            ArrivalDateTime: '2024-05-02T13:05:00',
            AirplaneID: 'AIRBUS320',
        },
        {
            id: 3,
            FlightID: 'GHI789',
            DepartureAirport: 'Gdańsk',
            ArrivalAirport: 'Tokio',
            DepartureDateTime: '2024-05-03T12:00:00',
            ArrivalDateTime: '2024-05-04T08:10:00',
            AirplaneID: 'BOEING787',
        },
    ];
    const formatDate = (dateTimeString: string) => {
        const date = new Date(dateTimeString);
        const formatter = new Intl.DateTimeFormat('en-UK', {
            weekday: 'long',
            day: 'numeric',
            month: 'numeric',
            year: 'numeric',
        });
        return formatter.format(date);
    };

    const calculateFlightDuration = (departureDateTime: string, arrivalDateTime: string) => {
        const departureTime = new Date(departureDateTime).getTime();
        const arrivalTime = new Date(arrivalDateTime).getTime();
        const durationInMilliseconds = arrivalTime - departureTime;
        const hours = Math.floor(durationInMilliseconds / (1000 * 60 * 60));
        const minutes = Math.floor((durationInMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    return (
        <div className="home-page">
            <h1 className="header">Available flights</h1>
            <div className="flight-container">
                {flights.map((flight) => (
                    <Link key={flight.id} to={`/flight/${flight.id}`} className="flight">
                        <div className="origin">{flight.DepartureAirport}</div>
                        <div className="destination">{flight.ArrivalAirport}</div>
                        <div className="date">{formatDate(flight.DepartureDateTime)}</div>
                        <div className="duration">Duration: {calculateFlightDuration(flight.DepartureDateTime, flight.ArrivalDateTime)}</div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default HomePage;