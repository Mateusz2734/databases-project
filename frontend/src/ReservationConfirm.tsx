import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import './css/ReservationConfirm.css';

const ReservationConfirm: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { reservationCost, id, reservationSeats } = location.state;

    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [email, setEmail] = useState('');

    const [flightDetails, setFlightDetails] = useState<any>(null);

    useEffect(() => {
        const fetchFlightDetails = async () => {
            try {
                const response = await fetch(`http://localhost:4444/flights/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    setFlightDetails(data.flight);
                } else {
                    throw new Error('Failed to fetch flight details');
                }
            } catch (error) {
                console.error(error);
            }
        };

        fetchFlightDetails();
    }, [id]);

    const handleBackClick = () => {
        navigate(-1);
    };
    const handleConfirmClick = async (event: React.MouseEvent) => {
        event.preventDefault();

        if (!name || !surname || !email) {
            window.alert('All fields must be filled.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            window.alert('Please enter a valid email.');
            return;
        }

        const formattedSeats = reservationSeats.map((seat: any) => ({
            row: seat.index.row,
            col: seat.index.col,
        }));

        const reservationData = {
            flight_id: Number(id),
            firstname: name,
            lastname: surname,
            email: email,
            seats: formattedSeats
        };
        const response = await fetch('http://localhost:4444/reservations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(reservationData)
        });
        const data = await response.json();
        if (response.ok) {
            if (data.message==='Reservation created') {
                window.alert('Reservation confirmed! Reservation ID: ' + data.reservation.reservation_id);
                navigate('/');
            } else {
                window.alert('Error confirming reservation: ' + data.message);
            }
        }
        else {
            window.alert('Error confirming reservation: ' + data.message);
        }
    };
    return (
        <div className="reservation-confirm-container">
            <h1>Reservation Confirmation</h1>
            <h2>Flight Details</h2>
            <div style={{ textAlign: 'right' }}>
                <button onClick={handleBackClick} id={'backButton'}>Back</button>
            </div>
            <p>Reserved Seats:</p>
            <table className="reservation-table">
                <thead>
                <tr>
                    <th>Seat Label</th>
                    <th>Seat Type</th>
                    <th>Row</th>
                    <th>Column</th>
                </tr>
                </thead>
                <tbody>
                {reservationSeats &&
                    reservationSeats.map((seat: any, index: number) => (
                        <tr key={index}>
                            <td>{seat.label}</td>
                            <td>{seat.type}</td>
                            <td>{seat.index.row}</td>
                            <td>{seat.index.col}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {flightDetails && (
                <>
                    <p>Flight ID: {flightDetails.flight_id}</p>
                    <p>Departure: {flightDetails.departure_airport}</p>
                    <p>Arrival: {flightDetails.arrival_airport}</p>
                    <p>Departure Time: {flightDetails.departure_datetime}</p>
                    <p>Arrival Time: {flightDetails.arrival_datetime}</p>
                </>
            )}

            <form className="reservation-form">
                <label>
                    Name:
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
                </label>
                <label>
                    Surname:
                    <input type="text" value={surname} onChange={(e) => setSurname(e.target.value)} />
                </label>
                <label>
                    Email:
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>
                <button onClick={handleConfirmClick}>Confirm Reservation</button>
            </form>
            <p>Reservations Cost: {reservationCost.toFixed(2)} €</p>
        </div>
    );
};

export default ReservationConfirm;
