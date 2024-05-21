import React, { useEffect, useState } from 'react';

import { AirportType, CountriesType, FlightType } from './types';
import { FlightCard } from './components/FlightCard';

import './css/FlightFinder.css';

const FlightFinder = () => {
    const [flights, setFlights] = useState<FlightType[]>([]);
    const [departureTime, setDepartureTime] = useState('');
    const [arrivalTime, setArrivalTime] = useState('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    const [originCountry, setOriginCountry] = useState('');
    const [originCity, setOriginCity] = useState('');
    const [destinationCountry, setDestinationCountry] = useState('');
    const [destinationCity, setDestinationCity] = useState('');

    const [countries, setCountries] = useState<CountriesType>({});
    const [originAirport, setOriginAirport] = useState('');
    const [destinationAirport, setDestinationAirport] = useState('');

    const [originCities, setOriginCities] = useState<string[]>([]);
    const [destinationCities, setDestinationCities] = useState<string[]>([]);
    const [originAirports, setOriginAirports] = useState<AirportType[]>([]);
    const [destinationAirports, setDestinationAirports] = useState<AirportType[]>([]);

    const fetchFlights = () => {
        if (!(originCity || destinationCity)) {
            window.alert('Please, provide origin city or destination city.');
            return;
        }

        if (originAirport === destinationAirport && !!originAirport && !!destinationAirport) {
            window.alert('Origin and destination airports must be different.');
            return;
        }

        const params = new URLSearchParams();

        const entries = {
            origin: originAirport,
            destination: destinationAirport,
            origin_city: originCity,
            destination_city: destinationCity,
            departure_time: departureTime,
            arrival_time: arrivalTime,
            min_price: minPrice,
            max_price: maxPrice,
        };

        for (const [key, value] of Object.entries(entries)) {
            if (value !== '') {
                params.append(key, value);
            }
        }

        const url = `http://localhost:4444/flights?${params.toString()}`;

        fetch(url)
            .then(response => response.json())
            .then((data: FlightType[]) => {
                if (data.length === 0) {
                    window.alert('No flights found with the given parameters.');
                }

                setFlights(data);
            })
            .catch(error => console.log('Error fetching flights:', error.code));
    };

    useEffect(() => {
        fetch('http://localhost:4444/cities')
            .then(response => response.json())
            .then(data => setCountries(data.countries))
            .catch(error => console.error('Error fetching countries:', error));
    }, []);


    useEffect(() => {
        if (!originCity) {
            setOriginAirports([]);
            return;
        }

        const params = new URLSearchParams();
        params.append('city', originCity);
        const url = `http://localhost:4444/airports?${params.toString()}`;

        fetch(url)
            .then(response => response.json())
            .then(data => setOriginAirports(data.airports))
            .catch(error => console.error('Error fetching airports:', error));
    }, [originCity]);

    useEffect(() => {
        if (!destinationCity) {
            setDestinationAirports([]);
            return;
        }

        const params = new URLSearchParams();
        params.append('city', destinationCity);
        const url = `http://localhost:4444/airports?${params.toString()}`;

        fetch(url)
            .then(response => response.json())
            .then(data => setDestinationAirports(data.airports))
            .catch(error => console.error('Error fetching airports:', error));
    }, [destinationCity]);

    const handleMinPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMinPrice(event.target.value);
    };

    const handleMaxPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setMaxPrice(event.target.value);
    };

    const handleDepartureTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDepartureTime(event.target.value);
    };

    const handleArrivalTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setArrivalTime(event.target.value);
    };

    const handleOriginCountryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCountry = event.target.value;
        setOriginCountry(selectedCountry);
        setOriginAirport(''); // Reset the airport when the country changes

        if (selectedCountry && countries[selectedCountry]) {
            setOriginCities(countries[selectedCountry]);
        } else {
            setOriginCities([]);
        }
    };

    const handleDestinationCountryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCountry = event.target.value;
        setDestinationCountry(selectedCountry);
        setDestinationAirport('');

        if (selectedCountry && countries[selectedCountry]) {
            setDestinationCities(countries[selectedCountry]);
        } else {
            setDestinationCities([]);
        }
    };

    const handleOriginCityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCity = event.target.value;
        setOriginCity(selectedCity);
        setOriginAirport('');
    };

    const handleDestinationCityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCity = event.target.value;
        setDestinationCity(selectedCity);
        setDestinationAirport('');
    };

    const handleOriginAirportChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setOriginAirport(event.target.value);
    };

    const handleDestinationAirportChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setDestinationAirport(event.target.value);
    };

    const handleFetchClick = () => {
        fetchFlights();
    };

    return (
        <div className="home-page">
            <h1>Search Flights</h1>
            <div className="input-container">
                <label htmlFor="originCountry">Origin Country:</label>
                <select id="originCountry" value={originCountry} onChange={handleOriginCountryChange}
                    className="input-field">
                    <option value="">Select a country</option>
                    {Object.keys(countries).map(country => (
                        <option key={country} value={country}>{country}</option>
                    ))}
                </select>
                <label htmlFor="originCity">Origin City:</label>
                <select id="originCity" value={originCity} onChange={handleOriginCityChange} className="input-field"
                    disabled={!originCountry}>
                    <option value="">Select a city</option>
                    {originCities.sort().map(city => (
                        <option key={city} value={city}>{city}</option>
                    ))}
                </select>
                <label htmlFor="originAirport">Origin Airport:</label>
                <select id="originAirport" value={originAirport} onChange={handleOriginAirportChange}
                    className="input-field" disabled={!originCity}>
                    <option value="">Select an airport</option>
                    {originAirports.map(airport => (
                        <option key={airport.airport_code} value={airport.airport_code}>{airport.airport_name}</option>
                    ))}
                </select>
                <label htmlFor="destinationCountry">Destination Country:</label>
                <select id="destinationCountry" value={destinationCountry} onChange={handleDestinationCountryChange}
                    className="input-field">
                    <option value="">Select a country</option>
                    {Object.keys(countries).map(country => (
                        <option key={country} value={country}>{country}</option>
                    ))}
                </select>
                <label htmlFor="destinationCity">Destination City:</label>
                <select id="destinationCity" value={destinationCity} onChange={handleDestinationCityChange}
                    className="input-field" disabled={!destinationCountry}>
                    <option value="">Select a city</option>
                    {destinationCities.sort().map(city => (
                        <option key={city} value={city}>{city}</option>
                    ))}
                </select>
                <label htmlFor="destinationAirport">Destination Airport:</label>
                <select id="destinationAirport" value={destinationAirport} onChange={handleDestinationAirportChange}
                    className="input-field" disabled={!destinationCity}>
                    <option value="">Select an airport</option>
                    {destinationAirports.map(airport => (
                        <option key={airport.airport_code} value={airport.airport_code}>{airport.airport_name}</option>
                    ))}
                </select>

                <label htmlFor="departureTime">Departure:</label>
                <input type="date" id="departureTime" value={departureTime} onChange={handleDepartureTimeChange}
                    className="input-field" />
                <label htmlFor="arrivalTime">Arrival:</label>
                <input type="date" id="arrivalTime" value={arrivalTime} onChange={handleArrivalTimeChange}
                    className="input-field" />
                <label htmlFor="minPrice">Min price:</label>
                <input type="number" id="minPrice" value={minPrice} onChange={handleMinPriceChange}
                    className="input-field" />
                <label htmlFor="maxPrice">Max price:</label>
                <input type="number" id="maxPrice" value={maxPrice} onChange={handleMaxPriceChange}
                    className="input-field" />
            </div>
            <button onClick={handleFetchClick}>Search</button>
            {flights.map((flight) => <FlightCard key={flight.flight_id} {...flight} />)}
        </div>
    );
};

export default FlightFinder;
