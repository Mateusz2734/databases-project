import React, { useEffect, useState } from 'react';
import { useParams , Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import './css/HomePage.css';

interface Flight {
    flight_id: number;
    departure_airport: string;
    arrival_airport: string;
    departure_datetime: string;
    arrival_datetime: string;
    airplane_id: number;
    price: number;
}

interface Reservation {
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

interface Seat {
    seat_type: string;
    row: number;
    col: number;
}

interface Props {
    flight: Flight;
    reservation: Reservation;
    seats: Seat[];
}

const CancelReservation: React.FC = () => {
    const { reservationId } = useParams<{ reservationId: string }>();
    const [flight, setFlight] = useState<Flight | null>(null);
    const [reservation, setReservation] = useState<Reservation | null>(null);
    const [seats, setSeats] = useState<Seat[]>([]);
    const [searchedReservationId, setSearchedReservationId] = useState<string>('');
    const [flightId, setFlightId] = useState<string>('');
    const navigate = useNavigate();

    const handleSearchClick = async () => {
        try {
            const response = await fetch(`http://localhost:4444/reservations/${searchedReservationId}`);
            if (!response.ok) {
                throw new Error('Error searching reservation');
            }
            const data = await response.json();
            setFlight(data.flight);
            setReservation(data.reservation);
            setSeats(data.seats);
            setFlightId(data.flight.flight_id);
        } catch (error) {
            console.error('Error searching reservation:', error);
            window.alert('Error searching reservation. Please try again later.');
        }
    };

    const handleCancelClick = async () => {
        const confirmCancel = window.confirm("Are you sure you want to cancel the reservation?");
        if (confirmCancel) {
            try {
                const response = await fetch(`http://localhost:4444/reservations/${searchedReservationId}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    window.alert('Reservation cancelled successfully!');
                    setFlight(null);
                    setReservation(null);
                    setSeats([]);
                    setSearchedReservationId('');
                } else {
                    throw new Error('Error cancelling reservation');
                }
            } catch (error) {
                console.error('Error cancelling reservation:', error);
                window.alert('Error cancelling reservation. Please try again later.');
            }
        }
    };

    const handleUpdateClick = async () => {
        navigate(`/update`, { state: { searchedReservationId , flightId} });
    };


    if (!flight || !reservation) {
        return (
            <div className="cancel-reservation-page">
                <h1>Search Flight</h1>
                <input
                    type="text"
                    value={searchedReservationId}
                    onChange={(e) => setSearchedReservationId(e.target.value)}
                    placeholder="Enter Reservation ID"
                />
                <button onClick={handleSearchClick}>Search</button>
            </div>
        );
    }

    return (
        <div className="cancel-reservation-page">
            <h1>Search Flight</h1>
            <input
                type="text"
                value={searchedReservationId}
                onChange={(e) => setSearchedReservationId(e.target.value)}
                placeholder="Enter Reservation ID"
            />
            <button onClick={handleSearchClick}>Search</button>

            <h2>Flight Details</h2>
            <p>Flight ID: {flight.flight_id}</p>
            <p>Departure Airport: {flight.departure_airport}</p>
            <p>Arrival Airport: {flight.arrival_airport}</p>
            <p>Departure Date Time: {new Date(flight.departure_datetime).toLocaleString()}</p>
            <p>Arrival Date Time: {new Date(flight.arrival_datetime).toLocaleString()}</p>
            <p>Price: ${flight.price}</p>

            <h2>Reservation Details</h2>
            <p>Reservation ID: {reservation.reservation_id}</p>
            <p>First Name: {reservation.firstname}</p>
            <p>Last Name: {reservation.lastname}</p>
            <p>Email: {reservation.email}</p>
            <p>Reservation Date Time: {new Date(reservation.reservation_datetime).toLocaleString()}</p>
            <p>Status: {reservation.status.reservation_status}</p>

            <table>
                <thead>
                <tr>
                    <th>Seat Type</th>
                    <th>Row</th>
                    <th>Column</th>
                </tr>
                </thead>
                <tbody>
                {seats.map((seat, index) => (
                    <tr key={index}>
                        <td>{seat.seat_type}</td>
                        <td>{seat.row}</td>
                        <td>{seat.col}</td>
                    </tr>
                ))}
                </tbody>
            </table>

            <button onClick={handleCancelClick} type="submit">Cancel Reservation</button>
            {/*<Link to={`/update/`}><button type="button">Update Reservation</button></Link>*/}
            <button onClick={handleUpdateClick} type="submit">Change Reservation</button>
            {/*<button onClick={handleCancelClick} type="submit">Cancel Reservation</button>*/}

        </div>
    );
};


export default CancelReservation;
