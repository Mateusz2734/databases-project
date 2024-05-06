import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './css/HomePage.css';

const HomePage: React.FC = () => {
    const [flights, setFlights] = useState([]);
    const [param1, setParam1] = useState('');
    const [param2, setParam2] = useState('');
    const [departureTime, setDepartureTime] = useState('');
    const [arrivalTime, setArrivalTime] = useState('');

    const fetchFlights = () => {
        if(param1==param2){
            window.alert('Origin and destination must be different.');
            return;
        }
        let url = `http://localhost:4444/flights?origin=${param1}&destination=${param2}`;
        if (departureTime) {
            const formattedDepartureTime = new Date(departureTime).toISOString().slice(0,10) + ' 00:00:00';
            url += `&departure_time=${formattedDepartureTime}`;
        }
        if (arrivalTime) {
            const formattedArrivalTime = new Date(arrivalTime).toISOString().slice(0,10) + ' 00:00:00';
            url += `&arrival_time=${formattedArrivalTime}`;
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

    const handleDepartureTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDepartureTime(event.target.value);
    };

    const handleArrivalTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setArrivalTime(event.target.value);
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
                <label htmlFor="origin">Origin:</label>
                <input type="text" id="origin" value={param1} onChange={handleParam1Change}/>
                <label htmlFor="destination">Destination:</label>
                <input type="text" id="destination" value={param2} onChange={handleParam2Change}/>
                <label htmlFor="departureTime">Departure Date:</label>
                <input type="date" id="departureTime" value={departureTime} onChange={handleDepartureTimeChange}/>

                <label htmlFor="arrivalTime">Arrival Date:</label>
                <input type="date" id="arrivalTime" value={arrivalTime} onChange={handleArrivalTimeChange}/>
                <button onClick={handleFetchClick}>Search</button>
            </div>

            {flights.map((flight: any) => (

                <Link key={flight.flight_id}
                      to={`/flight/${flight.flight_id}`}
                      className="flight">
                    <div className="origin">{flight.departure_airport}</div>
                    <div className="destination">{flight.arrival_airport}</div>
                    <div className="date-time">{formatDateAndTime(flight.departure_datetime)}</div>
                    <div
                        className="duration">Duration: {calculateFlightDuration(flight.departure_datetime, flight.arrival_datetime)}</div>
                    <div className="basic-price">Price: {flight.price}</div>
                </Link>
            ))}
        </div>
    );
};

export default HomePage;
