import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './HomePage';
import FlightDetailsPage from './FlightDetailsPage';
import './css/App.css';
import ReservationConfirm from './ReservationConfirm'

const App: React.FC = () => {
    return (
        <Router>
            <div>
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/flight/:id" element={<FlightDetailsPage />} />
                    <Route path="/Reservation" element={<ReservationConfirm />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;