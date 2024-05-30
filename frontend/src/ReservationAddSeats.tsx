import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from 'react';
import SeatchartJS from 'seatchart';

import Seatchart from './Seatchart';
import { getFlightSeatOptions } from './helpers/ui';
import { FlightData, SeatPlacement } from './types';

import './css/FlightDetailsPage.css';

export default function ReservationAddSeats() {
    const reservationID = useParams().id;
    const { flightID } = useLocation().state;

    const navigate = useNavigate();
    const seatchartRef = useRef<SeatchartJS>();
    const [flightData, setFlightData] = useState<FlightData>();

    useEffect(() => {
        const fetchFlightData = async () => {
            try {
                const response = await fetch(`http://localhost:4444/flights/${flightID}`);
                if (response.ok) {
                    const data = await response.json();
                    setFlightData(data);
                } else {
                    throw new Error('Failed to fetch flight data');
                }
            } catch (error) {
                console.error(error);
            }
        };
        fetchFlightData();
    }, [flightID]);

    let options = getFlightSeatOptions(flightData);
    options.cart = options.cart || {};
    options.cart.submitLabel = 'Add new seats';

    const handleUpdateClick = async () => {
        const selectedSeats = seatchartRef.current?.getCart();

        if (!selectedSeats) {
            window.alert('Please select at least one seat to add');
            return;
        }

        const toAdd: SeatPlacement[] = selectedSeats.map((seat) => {
            return { row: seat.index.row, col: seat.index.col };
        });

        if (toAdd.length === 0) {
            window.alert('Please select at least one seat to add');
            return;
        }

        try {
            const response = await fetch(`http://localhost:4444/reservations/${reservationID}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ seats: toAdd, type: 'add' })
            });

            if (response.ok) {
                window.alert('Reservation updated successfully!');
                navigate(`/reservations/${reservationID}`);
            } else {
                throw new Error('Error updating reservation');
            }
        } catch (error) {
            console.error('Error updating reservation:', error);
            window.alert('Error updating reservation. Please try again later.');
        }
    };

    useEffect(() => {
        const refCurrent = seatchartRef.current;
        const button = refCurrent?.element.querySelector('.sc-cart-btn.sc-cart-btn-submit');

        if (button) {
            button.addEventListener('click', handleUpdateClick);
        }

        return () => {
            if (button) {
                button.removeEventListener('click', handleUpdateClick);
            }
        };
    }, [navigate, flightID, handleUpdateClick]);

    return (
        <div className="flight-details-page-container">
            {flightData && <Seatchart ref={seatchartRef} options={options} />}
            <button id={'backButton'} onClick={() => navigate(-1)}>
                Back
            </button>
        </div>
    );
}