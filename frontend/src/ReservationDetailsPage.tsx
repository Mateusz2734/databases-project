import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { Reservation, Flight, Seat } from './types';

export default function ReservationDetailsPage() {
    const { id } = useParams();
    const [flight, setFlight] = useState<Flight | null>(null);
    const [reservation, setReservation] = useState<Reservation | null>(null);
    const [seats, setSeats] = useState<Seat[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        const getReservationData = async () => {
            try {
                const response = await fetch(`http://localhost:4444/reservations/${id}`);
                if (!response.ok) {
                    throw new Error('Error finding reservation');
                }
                const data = await response.json();
                setFlight(data.flight);
                setReservation(data.reservation);
                setSeats(data.seats);
            } catch (error) {
                console.error('Error finding reservation:', error);
                window.alert('Error finding reservation. Please try again later.');
            }
        };

        getReservationData();
    }, [id]);

    const handleRemoveClick = () => {
        navigate(`/reservations/${id}/update/remove`);
    };

    const handleAddClick = () => {
        navigate(`/reservations/${id}/update/add`, { state: { flightID: flight?.flight_id } });
    };

    const handleCancelClick = async () => {
        const confirmCancel = window.confirm("Are you sure you want to delete the reservation?");
        if (confirmCancel) {
            try {
                const response = await fetch(`http://localhost:4444/reservations/${id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    window.alert('Reservation deleted successfully!');
                    navigate('/');
                } else {
                    throw new Error('Error deleting reservation');
                }
            } catch (error) {
                console.error('Error deleting reservation:', error);
                window.alert('Error deleting reservation. Please try again later.');
            }
        }
    };

    if (!flight || !reservation) {
        return <></>;
    }

    return (
        <div className="cancel-reservation-page">
            <h2>Flight Details</h2>
            <p>Departure Airport: {flight.departure_airport}</p>
            <p>Arrival Airport: {flight.arrival_airport}</p>
            <p>Departure Time: {new Date(flight.departure_datetime).toLocaleString()}</p>
            <p>Expected Arrival Time: {new Date(flight.arrival_datetime).toLocaleString()}</p>

            <h2>Reservation Details</h2>
            <p>First Name: {reservation.firstname}</p>
            <p>Last Name: {reservation.lastname}</p>
            <p>Email: {reservation.email}</p>
            <p>Reserved at: {new Date(reservation.reservation_datetime).toLocaleString()}</p>

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
            <button style={{ marginRight: 10 }} onClick={handleCancelClick} type="submit">Delete Reservation</button>
            <button style={{ marginRight: 10 }} onClick={handleRemoveClick} type="submit">Remove some seats</button>
            <button onClick={handleAddClick} type="submit">Add new seats</button>
        </div>
    );
}