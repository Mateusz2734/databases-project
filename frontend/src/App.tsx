import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FlightFinder from './FlightFinder';
import FlightDetailsPage from './FlightDetailsPage';
import './css/App.css';
import ReservationConfirm from './ReservationConfirm';
import ReportsPage from './ReportsPage';
import ReservationRemoveSeats from './ReservationRemoveSeats';
import ReservationFinder from './ReservationFinder';
import ReservationDetails from './ReservationDetailsPage';
import HomePage from './HomePage';

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
            </Routes>
        </Router>
    );
};

export default App;