import React, { useRef, useEffect, useState } from 'react';
import SeatchartJS from 'seatchart';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import Seatchart from './Seatchart';
import { getFlightSeatOptions } from './helpers/ui';
import { FlightData } from './types';

import './css/FlightDetailsPage.css';

export default function FlightDetailsPage() {
    const navigate = useNavigate();
    const seatchartRef = useRef<SeatchartJS>();
    const [flightData, setFlightData] = useState<FlightData>();
    const { id } = useParams();

    useEffect(() => {
        const fetchFlightData = async () => {
            try {
                const response = await fetch(`http://localhost:4444/flights/${id}`);
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
    }, [id]);

    const options = getFlightSeatOptions(flightData);

    const handleBackClick = () => {
        navigate(-1);
    };

    const handleClick = () => {
        const reservationCost = seatchartRef.current?.getCartTotal();
        const reservationSeats = seatchartRef.current?.getCart();

        if (reservationCost && reservationCost > 0) {
            navigate(`/confirm`, { state: { reservationCost, id, reservationSeats } });
        } else {
            alert('Please select at least one seat before proceeding to reservation.');
        }
    };

    useEffect(() => {
        const refCurrent = seatchartRef.current;
        const button = refCurrent?.element.querySelector('.sc-cart-btn.sc-cart-btn-submit');

        if (button) {
            console.log("Adding event listener");
            button.addEventListener('click', handleClick);
        }

        return () => {
            if (button) {
                console.log("Removing event listener");
                button.removeEventListener('click', handleClick);
            }
        };
    }, [navigate, id, handleClick]);

    return (
        <div className="flight-details-page-container">
            {flightData && <Seatchart ref={seatchartRef} options={options} />}
            <button id={'backButton'} onClick={handleBackClick}>
                Back
            </button>
        </div>
    );
};
