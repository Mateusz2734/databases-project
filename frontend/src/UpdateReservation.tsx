import React, {useState, useEffect, useRef} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import Seatchart from './Seatchart';
import SeatchartJS, {SeatType} from "seatchart";

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
        // console.log('Fetching flight:', flightId);
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


    const options = flightData
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
        }
        : null;

    // const handleUpdateClick = async () => {
    const handleUpdateClick = async () => {
        // Get the selected seats from the Seatchart component
        // const selectedSeats = seatchartRef.current?.getSelectedSeats();
        const selectedSeats = seatchartRef.current?.getCart();
        // console.log('Selected seats:', selectedSeats);
        console.log(JSON.stringify(selectedSeats));
        let formattedSeats: { row: number; column: number; }[];
        if (selectedSeats) {
            formattedSeats = selectedSeats.map(item => ({
                row: item.index.row,
                column: item.index.col
            }));
            // console.log(transformedData);
        } else {
            formattedSeats = [];
            console.log("No selected seats.");
        }
        // const formattedSeats = selectedSeats.map((seat: any) => ({
        //     row: seat.index.row,
        //     col: seat.index.col,
        // }));

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
    // };

    return (
        <div >
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
                                <td>{seat.row+1}</td>
                                <td>{seat.col+1}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
            {options && <Seatchart ref={seatchartRef} options={options}/>}

            <button onClick={handleUpdateClick}>Update Reservation</button>
        </div>
    );
};

export default UpdateReservation;