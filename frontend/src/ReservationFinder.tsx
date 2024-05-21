import { useState } from "react";
import { ReservationDetails } from "./types";
import { ReservationCard } from "./components/ReservationCard";

export default function ReservationFinder() {
    const [name, setName] = useState('');
    const [surname, setSurname] = useState('');
    const [email, setEmail] = useState('');

    const [reservations, setReservations] = useState<ReservationDetails[]>([]);

    const findReservations = async () => {
        if (!name || !surname || !email) {
            window.alert('All fields must be filled.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            window.alert('Please enter a valid email.');
            return;
        }

        const response = await fetch(`http://localhost:4444/reservations?firstname=${name}&lastname=${surname}&email=${email}`);
        if (response.ok) {
            const data = await response.json();
            setReservations(data.reservations);
        } else {
            window.alert('Failed to fetch reservations.');
        }
    };

    return (
        <>
            <form onSubmit={(event) => {
                event.preventDefault();
                findReservations();
            }} className="reservation-form">
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
                <button type="submit">Find reservations</button>
            </form>

            {reservations.map((details) => (<ReservationCard key={details.reservation.reservation_id} {...details} />))}
        </>
    );
}