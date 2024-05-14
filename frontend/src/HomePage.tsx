import React, {useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import './css/HomePage.css';

type CountriesType = { [key: string]: string[] };
type AirportType = { airport_code: string, airport_name: string, city: string, country: string };

const HomePage: React.FC = () => {
    const [flights, setFlights] = useState([]);
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
    const [airports, setAirports] = useState<AirportType[]>([]);

    const [originCities, setOriginCities] = useState<string[]>([]);
    const [destinationCities, setDestinationCities] = useState<string[]>([]);
    const [originAirports, setOriginAirports] = useState<AirportType[]>([]);
    const [destinationAirports, setDestinationAirports] = useState<AirportType[]>([]);

    const fetchFlights = () => {
        if (!originCountry || !destinationCountry) {
            window.alert('Both origin and destination countries must be set.');
            return;
        }

        if (!originAirport || !destinationAirport) {
            window.alert('Both origin and destination airports must be chosen.');
            return;
        }

        if(originAirport === destinationAirport){
            window.alert('Origin and destination airports must be different.');
            return;
        }
        let url = `http://localhost:4444/flights?origin=${originAirport}&destination=${destinationAirport}`;
        if (departureTime) {
            const formattedDepartureTime = new Date(departureTime).toISOString().slice(0,10) + ' 00:00:00';
            url += `&departure_time=${formattedDepartureTime}`;
        }
        if (arrivalTime) {
            const formattedArrivalTime = new Date(arrivalTime).toISOString().slice(0,10) + ' 00:00:00';
            url += `&arrival_time=${formattedArrivalTime}`;
        }

        if ((minPrice && !maxPrice) || (!minPrice && maxPrice)) {
            window.alert('Both min price and max price must be set.');
            return;
        }

        if (minPrice && maxPrice && (Number(minPrice) < 0 || Number(minPrice) > Number(maxPrice))) {
            window.alert('Min price must be greater than or equal to 0 and less than or equal to max price.');
            return;
        }
        if(minPrice && maxPrice){
            url += `&min_price=${minPrice}&max_price=${maxPrice}`;
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

        let url = 'http://localhost:4444/airports';
        const params = new URLSearchParams();

        params.append('city', originCity);

        url += `?${params.toString()}`;

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

        let url = 'http://localhost:4444/airports';
        const params = new URLSearchParams();

        params.append('city', destinationCity);

        url += `?${params.toString()}`;

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

        if (selectedCity) {
            const cityAirports = airports.filter(airport => airport.city === selectedCity && airport.country === originCountry);
            setOriginAirports(cityAirports);
        } else {
            setOriginAirports([]);
        }
    };

    const handleDestinationCityChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedCity = event.target.value;
        setDestinationCity(selectedCity);
        setDestinationAirport('');

        if (selectedCity) {
            const cityAirports = airports.filter(airport => airport.city === selectedCity && airport.country === destinationCountry);
            setDestinationAirports(cityAirports);
        } else {
            setDestinationAirports([]);
        }
    };

    const handleOriginAirportChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setOriginAirport(event.target.value);
    };

    const handleDestinationAirportChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setDestinationAirport(event.target.value);
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
                    {originCities.map(city => (
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
                    {destinationCities.map(city => (
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
                       className="input-field"/>
                <label htmlFor="arrivalTime">Arrival:</label>
                <input type="date" id="arrivalTime" value={arrivalTime} onChange={handleArrivalTimeChange}
                       className="input-field"/>
                <label htmlFor="minPrice">Min price:</label>
                <input type="number" id="minPrice" value={minPrice} onChange={handleMinPriceChange}
                       className="input-field"/>
                <label htmlFor="maxPrice">Max price:</label>
                <input type="number" id="maxPrice" value={maxPrice} onChange={handleMaxPriceChange}
                       className="input-field"/>

            </div>
            <button onClick={handleFetchClick}>Search</button>

            {flights.map((flight: any) => (

                <Link key={flight.flight_id}
                      to={`/flight/${flight.flight_id}`}
                      className="flight">
                    <div className="origin">{originCity}</div>
                    <div className="destination">{destinationCity}</div>
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
