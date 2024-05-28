import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DataGrid, GridColDef, GridRowId } from '@mui/x-data-grid';

import { Seat, Reservation, SeatPlacement } from './types';

import './css/FlightFinder.css';

export default function UpdateReservation() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [reservation, setReservation] = useState<Reservation | null>(null);
    const [seats, setSeats] = useState<(Seat & { id: number; })[]>([]);
    const [selectionModel, setSelectionModel] = useState<GridRowId[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(`http://localhost:4444/reservations/${id}`);
                if (!response.ok && response.status !== 404) {
                    throw new Error('Error searching reservation');
                }
                const data = await response.json();
                setReservation(data.reservation);
                setSeats(data.seats.map((seat: Seat, index: number) => ({ ...seat, id: index })));
            } catch (error) {
                console.error('Error searching reservation:', error);
                window.alert('Error searching reservation. Please try again later.');
            }
        };
        fetchData();
    }, [id]);

    const handleUpdateClick = async () => {
        const toDelete: SeatPlacement[] = [];
        selectionModel.forEach((val) => {
            const seat = seats[Number(val)];
            toDelete.push({ row: seat.row, col: seat.col });
        });

        if (toDelete.length === 0) {
            window.alert('Please select at least one seat to remove');
            return;
        }

        if (toDelete.length === seats.length) {
            window.alert('Cannot remove all seats from a reservation. Please delete the reservation instead.');
            return;
        }
        try {
            const response = await fetch(`http://localhost:4444/reservations/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ seats: toDelete, type: 'remove' })
            });

            if (response.ok) {
                setSeats(seats.filter((_, index) => !selectionModel.includes(index)));
                setSelectionModel([]);
                window.alert('Reservation updated successfully!');

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
            <div>
                <h3>Choose seats to remove:</h3>
                <div style={{ width: '100%', marginBottom: 10 }}>
                    {reservation ? (
                        <DataGrid
                            rows={seats}
                            columns={columns}
                            checkboxSelection
                            disableColumnMenu
                            disableColumnSorting
                            rowSelectionModel={selectionModel}
                            onRowSelectionModelChange={(newSelection) => {
                                setSelectionModel(newSelection);
                            }}
                        />
                    ) : <p>Reservation does not exist</p>}
                </div>
            </div>

            <button className={'updateButton'} onClick={handleUpdateClick}>
                Update
            </button>
        </div>
    );
};

function display(snake: string) {
    const capitalized = snake.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1));
    return capitalized.join(' ');
}

const columns: GridColDef[] = [
    { field: 'seat_type', minWidth: 150, headerName: "Seat Class", type: 'string', valueGetter: (seat_type: string) => display(seat_type) },
    { field: 'row', headerName: 'Row', type: 'number', valueGetter: (row: number) => row + 1 },
    { field: 'col', headerName: 'Column', type: 'number', valueGetter: (col: number) => col + 1 }
];
