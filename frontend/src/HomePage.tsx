import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './css/HomePage.css';

const HomePage: React.FC = () => {
    const [flights, setFlights] = useState([]);
    const [param1, setParam1] = useState('');
    const [param2, setParam2] = useState('');
    const url = `http://localhost:4444/flights?origin=${param1}&destination=${param2}`;

    const fetchFlights = () => {
        if(param1==param2){
            window.alert('Origin and destination must be different.');
            return;
        }
        fetch(url)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if (data.message === 'No flights found') {
                    window.alert('No flights found with the given parameters.');
                } else {
                    setFlights(data);
                }
            })
            .catch(error => console.error('Error fetching flights:', error));
    };

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

    const handleParam1Change = (event: React.ChangeEvent<HTMLInputElement>) => {
        setParam1(event.target.value);
    };

    const handleParam2Change = (event: React.ChangeEvent<HTMLInputElement>) => {
        setParam2(event.target.value);
    };

    const handleFetchClick = () => {
        if (param1.length === 3 && param2.length === 3) {
            fetchFlights();
        } else {
            window.alert('Both parameters must be 3 characters long.');
        }
    };

    return (
        <div className="home-page">
            <div className="input-container">
                <input type="text" value={param1} onChange={handleParam1Change} />
                <input type="text" value={param2} onChange={handleParam2Change} />
                <button onClick={handleFetchClick}>Search</button>
            </div>
            {flights.map((flight: any) => (
                <Link key={flight.flight_id}
                      to={`/flight/${flight.flight_id}`}
                      className="flight">
                    <div className="origin">{flight.departure_airport}</div>
                    <div className="destination">{flight.arrival_airport}</div>
                    <div className="date">{formatDate(flight.departure_datetime)}</div>
                    <div
                        className="duration">Duration: {calculateFlightDuration(flight.departure_datetime, flight.arrival_datetime)}</div>
                </Link>
            ))}
        </div>
    );
};

export default HomePage;
