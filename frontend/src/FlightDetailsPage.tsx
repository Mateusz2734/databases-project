import React, { useRef, useEffect, useState } from 'react';
import SeatchartJS, { Options } from 'seatchart';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

import { columnLabeler, rowLabeler } from './helpers/ui';
import Seatchart from './Seatchart';
import './css/FlightDetailsPage.css';

const FlightDetailsPage: React.FC = () => {
    const navigate = useNavigate();
    const seatchartRef = useRef<SeatchartJS>();
    const [flightData, setFlightData] = useState<any>(null);
    const { id } = useParams();

    interface SeatType {
        label: string;
        cssClass: string;
        price: number;
        seatRows?: number[];
    }

    useEffect(() => {
        const fetchFlightData = async () => {
            try {
                const response = await fetch(`http://localhost:4444/flights/${id}`);
                if (response.ok) {
                    const data = await response.json();
                    console.log(data);
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

    const defaultOptions: Options = {
        map: {
            rows: 0,
            columns: 0,
            seatTypes: {
                default: {
                    label: 'Default',
                    cssClass: 'default',
                    price: 0,
                },
            },
            reservedSeats: [],
            rowSpacers: [],
            columnSpacers: [],
        },
    };


    const options: Options = flightData
        ? {
            cart: { currency: "PLN" },
            map: {
                rows: flightData.plane.diagram_metadata.rows,
                columns: flightData.plane.diagram_metadata.columns,
                seatTypes: Object.entries(flightData.plane.diagram_metadata.seatTypes).reduce((acc, [key, value]) => {
                    const seatType = value as SeatType;
                    let multiplier = 1;
                    if (seatType.label === 'Business') {
                        multiplier = 2;
                    }
                    else if (seatType.label === 'First Class') {
                        multiplier = 3.5;
                    }
                    else if (seatType.label === 'Economy Plus') {
                        multiplier = 1.2;
                    }

                    acc[key] = {
                        label: seatType.label,
                        cssClass: seatType.cssClass,
                        price: parseFloat((flightData.flight.price * multiplier).toFixed(2)),
                        seatRows: seatType.seatRows,
                    };

                    return acc;
                }, {} as any),
                reservedSeats: flightData.reserved,
                rowSpacers: flightData.plane.diagram_metadata.rowSpacers,
                columnSpacers: flightData.plane.diagram_metadata.columnSpacers,
                disabledSeats: flightData.plane.diagram_metadata.disabledSeats,
                indexerColumns: { label: columnLabeler },
                indexerRows: { label: rowLabeler },
            }
        }
        : defaultOptions;

    const handleBackClick = () => {
        navigate(-1);
    };

    useEffect(() => {
        const handleClick = () => {
            const reservationCost = seatchartRef.current?.getCartTotal();
            const reservationSeats = seatchartRef.current?.getCart();

            if (reservationCost && reservationCost > 0) {
                navigate(`/Reservation`, { state: { reservationCost, id, reservationSeats } });
            } else {
                alert('Please select at least one seat before proceeding to reservation.');
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
    }, [navigate, seatchartRef.current]);

    return (
        <div className="flight-details-page-container">
            {flightData && <Seatchart ref={seatchartRef} options={options} />}
            <button id={'backButton'} onClick={handleBackClick}>
                Back
            </button>
        </div>
    );
};

export default FlightDetailsPage;
