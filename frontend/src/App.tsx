import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import FlightDetailsPage from './FlightDetailsPage';
import './css/App.css';
import ReservationConfirm from './ReservationConfirm';
import ReportsPage from './ReportsPage';
import UpdateReservation from './UpdateReservation';
import ReservationFinder from './ReservationFinder';
import ReservationDetails from './ReservationDetailsPage';

const App: React.FC = () => {
    return (
        <Router>
            <div>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/flight/:id" element={<FlightDetailsPage />} />
                    <Route path="/Reservation" element={<ReservationConfirm />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="/reservations/:id/update" element={<UpdateReservation />} />
                    <Route path="/reservations" element={<ReservationFinder />} />
                    <Route path="/reservations/:id" element={<ReservationDetails />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;