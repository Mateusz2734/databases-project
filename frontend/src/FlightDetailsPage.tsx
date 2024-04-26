import React, {useRef, useEffect, useContext} from 'react';
import SeatchartJS, { Options } from "seatchart";
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import Seatchart from "./Seatchart";
import './css/FlightDetailsPage.css';

const options: Options = {
    map: {
        rows: 10,
        columns: 10,
        seatTypes: {
            default: {
                label: 'Economy',
                cssClass: 'economy',
                price: 15,
            },
            first: {
                label: 'First Class',
                cssClass: 'first-class',
                price: 25,
                seatRows: [0, 1, 2],
            },
            reduced: {
                label: 'Reduced',
                cssClass: 'reduced',
                price: 10,
                seatRows: [7, 8, 9],
            },
        },
        disabledSeats: [
            { row: 0, col: 0 },
            { row: 0, col: 9 },
        ],
        reservedSeats: [
            { row: 0, col: 3 },
            { row: 0, col: 4 },
        ],
        rowSpacers: [3, 7],
        columnSpacers: [5],
    },
};

const FlightDetailsPage: React.FC = () => {
    const navigate = useNavigate();
    const seatchartRef = useRef<SeatchartJS>();
    const { id } = useParams(); // accessing flight id from the URL


    const handleBackClick = () => {
        navigate(-1);
    };

    useEffect(() => {
        const handleClick = () => {
            const reservationCost = seatchartRef.current?.getCartTotal();
            const reservationSeats= seatchartRef.current?.getCart();

            if (reservationCost && reservationCost > 0) {
                navigate(`/Reservation`, { state: { reservationCost, id, reservationSeats } }); /// TU PRZEKIEROWANIE DO STRONY REZERWACJI
            } else {
                alert("Please select at least one seat before proceeding to reservation.");
            }
        };


        if (seatchartRef.current) {
            const button = seatchartRef.current.element.querySelector('.sc-cart-btn.sc-cart-btn-submit');
            if (button) {
                button.addEventListener('click', handleClick);
            }
        }

        return () => {
            if (seatchartRef.current) {
                const button = seatchartRef.current.element.querySelector('.sc-cart-btn.sc-cart-btn-submit');
                if (button) {
                    button.removeEventListener('click', handleClick);
                }
            }
        };
    }, [navigate]);

    return (
        <div className="flight-details-page-container">
            <Seatchart ref={seatchartRef} options={options}/>
            <button id={'backButton'} onClick={handleBackClick}>Back</button>
        </div>
    );
};

export default FlightDetailsPage;