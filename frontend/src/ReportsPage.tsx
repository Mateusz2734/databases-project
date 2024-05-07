import { useEffect, useState } from 'react';
import axios from 'axios';
import { Chart } from './components/Chart';

type SeatTypeEarnings = {
    seat_type: string;
    value: number;
};

type DestinationPopularity = {
    arrival_airport: string;
    seat_count: number;
};

type RoutePopularity = {
    departure_airport: string;
    arrival_airport: string;
    seat_count: number;
};

type ReportsResponse = {
    periodic_earnings: number[][],
    total_earnings: SeatTypeEarnings[],
    tickets_sold: number,
    popular_destinations: DestinationPopularity[],
    popular_flights: RoutePopularity[];
};

export default function ReportsPage() {
    const [chartData, setChartData] = useState<number[][] | []>([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const resp = await axios.get<ReportsResponse>('http://localhost:4444/reports?from=2024-01-01&to=2024-12-31&limit=20');
                console.log(resp.data);
                setChartData(resp.data.periodic_earnings);
            } catch (error) {
                console.log(error);
            }
        };

        if (chartData.length === 0) {
            loadData();
        }
    }, []);

    return (
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            <div style={{ width: "80%" }}>
                <Chart chartData={chartData} />
            </div>
        </div>
    );
}

