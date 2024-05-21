import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import FlightFinder from './FlightFinder';
import FlightDetailsPage from './FlightDetailsPage';
import './css/App.css';
import ReservationConfirm from './ReservationConfirm';
import ReportsPage from './ReportsPage';
import UpdateReservation from './UpdateReservation';
import ReservationFinder from './ReservationFinder';
import ReservationDetails from './ReservationDetailsPage';
import HomePage from './HomePage';

const App: React.FC = () => {
    return (
        <Router>
            <div>
                <Routes>
                    <Route path="/" index element={<HomePage />} />
                    <Route path="/flights" element={<FlightFinder />} />
                    <Route path="/flights/:id" element={<FlightDetailsPage />} />
                    <Route path="/confirm" element={<ReservationConfirm />} />
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