import { useEffect, useState } from 'react';
import { useSearchParams } from "react-router-dom";
import axios from 'axios';

import { DestinationPopularity, RoutePopularity, SeatTypeEarnings, TableType } from './types';
import { DataTable } from './components/DataTable';
import { Chart } from './components/Chart';


type ReportsResponse = {
    periodic_earnings: number[][],
    total_earnings: SeatTypeEarnings[],
    tickets_sold: number,
    popular_destinations: DestinationPopularity[],
    popular_flights: RoutePopularity[];
};

export default function ReportsPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    const [chartData, setChartData] = useState<number[][] | []>([]);
    const [ticketsSold, setTicketsSold] = useState<number>(0);
    const [popularDestinations, setPopularDestinations] = useState<DestinationPopularity[]>([]);
    const [popularFlights, setPopularFlights] = useState<RoutePopularity[]>([]);
    const [totalEarnings, setTotalEarnings] = useState<SeatTypeEarnings[]>([]);

    const from = searchParams.get("from") ?? '2024-01-01';
    const to = searchParams.get("to") ?? '2024-12-31';
    const limit = searchParams.get("limit") ?? '20';

    useEffect(() => {
        const loadData = async () => {
            try {
                const resp = await axios.get<ReportsResponse>(`http://localhost:4444/reports?from=${from}&to=${to}&limit=${limit}`);

                setChartData(resp.data.periodic_earnings);
                setTicketsSold(resp.data.tickets_sold);
                setPopularDestinations(resp.data.popular_destinations);
                setPopularFlights(resp.data.popular_flights);
                setTotalEarnings(resp.data.total_earnings);
            } catch (error) {
                console.log(error);
            }
        };

        loadData();
    }, [from, to, limit]);

    return (
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
            <div style={{ width: "80%", marginBottom: "10%", marginTop: "5%" }}>
                <Chart chartData={chartData} />
                <h2>Tickets sold:</h2>
                <p>{ticketsSold}</p>
                <h2>Earnings from each seat type:</h2>
                {totalEarnings.map((seatTypeEarnings) => (
                    <p key={seatTypeEarnings.seat_type}>{seatTypeEarnings.seat_type}: {seatTypeEarnings.value.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                ))}
                <div style={{ width: "100%", display: "flex", flexDirection: "row", justifyContent: "space-around" }}>
                    <h2>Popular destinations:</h2>
                    <h2>Popular flights:</h2>

                </div>
                <div style={{ width: "100%", display: "flex", flexDirection: "row" }}>
                    <DataTable rows={popularDestinations} type={TableType.Destination} />
                    <DataTable rows={popularFlights} type={TableType.Route} />

                </div>
            </div>
        </div >
    );
}
