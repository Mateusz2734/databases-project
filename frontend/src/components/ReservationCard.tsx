import { useNavigate } from 'react-router-dom';
import { ReservationDetails } from '../types';

export function ReservationCard({ reservation, departure_airport, arrival_airport, departure_datetime }: ReservationDetails) {
    const navigate = useNavigate();

    const handleCancelClick = async () => {
        const confirmCancel = window.confirm("Are you sure you want to cancel the reservation?");
        if (confirmCancel) {
            try {
                const response = await fetch(`http://localhost:4444/reservations/${reservation.reservation_id}`, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    window.alert('Reservation cancelled successfully!');
                    navigate('/');
                } else {
                    throw new Error('Error cancelling reservation');
                }
            } catch (error) {
                console.error('Error cancelling reservation:', error);
                window.alert('Error cancelling reservation. Please try again later.');
            }
        }
    };

    return (
        <div className="cancel-reservation-page" style={{ marginTop: 10 }}>
            <p>{departure_airport}-{arrival_airport}</p>
            <p>Departures at {new Date(departure_datetime).toLocaleString()}</p>
            <p>Reserved at {new Date(reservation.reservation_datetime).toLocaleString()}</p>
            <button onClick={handleCancelClick} style={{ marginRight: 5 }}>
                Cancel reservation
            </button>
            <button onClick={() => navigate(`/reservations/${reservation.reservation_id}`)}>
                More details
            </button>
        </div>
    );
}