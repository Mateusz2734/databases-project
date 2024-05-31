import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HomePage from './HomePage';
import ReportsPage from './ReportsPage';
import FlightFinder from './FlightFinder';
import FlightDetailsPage from './FlightDetailsPage';
import ReservationFinder from './ReservationFinder';
import ReservationConfirm from './ReservationConfirm';
import ReservationAddSeats from './ReservationAddSeats';
import ReservationDetails from './ReservationDetailsPage';
import ReservationRemoveSeats from './ReservationRemoveSeats';

import './css/App.css';

const App: React.FC = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" index element={<HomePage />} />
                <Route path="/flights" element={<FlightFinder />} />
                <Route path="/flights/:id" element={<FlightDetailsPage />} />
                <Route path="/confirm" element={<ReservationConfirm />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/reservations" element={<ReservationFinder />} />
                <Route path="/reservations/:id" element={<ReservationDetails />} />
                <Route path="/reservations/:id/update/remove" element={<ReservationRemoveSeats />} />
                <Route path="/reservations/:id/update/add" element={<ReservationAddSeats />} />
            </Routes>
        </Router>
    );
};

export default App;