import React, {useState, useEffect, useRef} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import Seatchart from './Seatchart';
import SeatchartJS, {Events, Options, SeatType, SubmitEvent} from "seatchart";
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
interface Seat {
    seat_type: string;
    row: number;
    col: number;
}

interface Reservation {
    reservation_id: string;
    flight_id: number;
    firstname: string;
    lastname: string;
    email: string;
    reservation_datetime: string;
    status: {
        reservation_status: string;
        valid: boolean;
    };
    seats: Seat[];
}

const UpdateReservation: React.FC = () => {
    const seatchartRef = useRef<SeatchartJS>();
    const [flightId, setFlightId] = useState<string>('');
    const navigate = useNavigate();
    const location = useLocation();
    const { searchedReservationId } = location.state;
    // const { reservationId } = useParams<{ reservationId: string }>();
    const [flight, setFlight] = useState<Flight | null>(null);
    const [reservation, setReservation] = useState<Reservation | null>(null);
    const [seats, setSeats] = useState<Seat[]>([]);
    const [flightData, setFlightData] = useState<any>(null);

    useEffect(() => {
        const handleSearchClick = async () => {
            console.log('Searching reservation:', searchedReservationId);
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
                console.log('Fetching flight data:', flightId);

            } catch (error) {
                console.error('Error searching reservation:', error);
                window.alert('Error searching reservation. Please try again later.');
            }
        };
        handleSearchClick();
    }, [searchedReservationId]);

    useEffect(() => {
        if(!flightId) return;
        const fetchFlightData = async () => {
            try {
                const response = await fetch(`http://localhost:4444/flights/${flightId}`);
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
    }, [flightId]);

    useEffect(() => {
        console.log("xd")
        if (seatchartRef.current) {
            console.log("xd2")
            seatchartRef.current?.element.querySelector('.sc-cart-btn.sc-cart-btn-submit')?.addEventListener('click', handleUpdateClick);
        }
    },[seatchartRef.current]);


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
            map: {
                rows: flightData.plane.diagram_metadata.rows,
                columns: flightData.plane.diagram_metadata.columns,
                seatTypes: Object.entries(flightData.plane.diagram_metadata.seatTypes).reduce((acc, [key, value]) => {
                    const seatType = value as SeatType;
                    let multiplier = 1;
                    if(seatType.label === 'Business' ) {
                        multiplier = 2;
                    }
                    else if(seatType.label === 'First Class'){
                        multiplier = 3.5;
                    }
                    else if(seatType.label === 'Economy Plus'){
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
            }
        } : defaultOptions;

    const handleUpdateClick = async () => {
        const selectedSeats = seatchartRef.current?.getCart();
        let formattedSeats: { row: number; column: number; }[];
        if (selectedSeats) {
            formattedSeats = selectedSeats.map(item => ({
                row: item.index.row,
                column: item.index.col
            }));
        } else {
            formattedSeats = [];
            console.log("No selected seats.");
        }

        try {
            const response = await fetch(`http://localhost:4444/reservations/${searchedReservationId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ formattedSeats })
            });

            if (response.ok) {
                window.alert('Reservation updated successfully!');
                setSeats(seats);
            } else {
                throw new Error('Error updating reservation');
            }
        } catch (error) {
            console.error('Error updating reservation:', error);
            window.alert('Error updating reservation. Please try again later.');
        }
    };

    const handleBackClick = () => {
        navigate(-1);
    };

    return (
        <div className="updateFlight">
            <button className={'backButton'} onClick={handleBackClick}>
                Back
            </button>
            <h1>Update Reservation</h1>
            {reservation && (
                <div>
                    <h3>Reservated Seats:</h3>
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
                                <td>{seat.row + 1}</td>
                                <td>{seat.col + 1}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
            {flightData && <Seatchart ref={seatchartRef} options={options}/>}
            <button className={'updateButton'} onClick={handleUpdateClick}>
                Update
            </button>
        </div>
    );
};

export default UpdateReservation;

