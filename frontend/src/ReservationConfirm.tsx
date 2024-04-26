import React, { useState, useContext } from 'react';
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
    const handleBackClick = () => {
        navigate(-1);
    };
    return (
        <div className="reservation-confirm-container">
            <h1>Reservation Confirmation</h1>
            <h2>Flight Details</h2>
            <div style={{textAlign: 'right'}}>
                <button onClick={handleBackClick} id={'backButton'}>Back</button>
            </div>
            <form className="reservation-form">
                <label>
                    Name:
                    <input type="text" value={name} onChange={e => setName(e.target.value)}/>
                </label>
                <label>
                    Surname:
                    <input type="text" value={surname} onChange={e => setSurname(e.target.value)}/>
                </label>
                <label>
                    Email:
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}/>
                </label>
                <input type="submit" value="Confirm Reservation"/>
            </form>
            <h2>Reservation Details</h2>
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
                {reservationSeats && reservationSeats.map((seat: {
                    label: string,
                    type: string,
                    index: { row: number; col: number; };
                }, index: number) => (
                    <tr key={index}>
                        <td>{seat.label}</td>
                        <td>{seat.type}</td>
                        <td>{seat.index.row}</td>
                        <td>{seat.index.col}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            <p>Reservations Cost: {reservationCost} €</p>
        </div>
    );
};

export default ReservationConfirm;