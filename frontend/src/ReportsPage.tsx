import { useEffect, useState } from 'react';
import { useDebounce } from '@uidotdev/usehooks';
import dayjs, { Dayjs } from 'dayjs';
import axios from 'axios';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';

import { DestinationPopularity, RoutePopularity, SeatTypeEarnings, TableType } from './types';
import { ChartContainer, TableContainer } from './components/Containers';
import { Card } from './components/Card';

dayjs.extend((_option, dayjsClass, _dayjsFactory) => {
    const oldFormat = dayjsClass.prototype.format;

    dayjsClass.prototype.format = function (formatString) {
        return oldFormat.bind(this)(formatString ?? 'YYYY-MM-DD');
    };
});

type ReportsResponse = {
    periodic_earnings: number[][],
    total_earnings: SeatTypeEarnings[],
    tickets_sold: number,
    popular_destinations: DestinationPopularity[],
    popular_flights: RoutePopularity[];
};

export default function ReportsPage() {
    const [from, setFrom] = useState<Dayjs | null>(dayjs('2024-01-01'));
    const [to, setTo] = useState<Dayjs | null>(dayjs('2024-12-31'));
    const [limit, setLimit] = useState<number>(20);

    const [chartData, setChartData] = useState<number[][] | []>([]);
    const [ticketsSold, setTicketsSold] = useState<number>(0);
    const [popularDestinations, setPopularDestinations] = useState<DestinationPopularity[]>([]);
    const [popularFlights, setPopularFlights] = useState<RoutePopularity[]>([]);
    const [totalEarnings, setTotalEarnings] = useState<SeatTypeEarnings[]>([]);
    const debouncedLimit = useDebounce(limit, 1000);

    useEffect(() => {
        const loadData = async () => {
            let results: ReportsResponse | null = null;
            if (debouncedLimit) {
                const resp = await axios.get<ReportsResponse>(`http://localhost:4444/reports?from=${from?.format()}&to=${to?.format()}&limit=${debouncedLimit}`);
                results = resp.data || null;
            }

            if (!results) {
                return;
            }

            setChartData(results.periodic_earnings);
            setTicketsSold(results.tickets_sold);
            setPopularDestinations(results.popular_destinations);
            setPopularFlights(results.popular_flights);
            setTotalEarnings(results.total_earnings);
        };

        loadData();
    }, [from, to, debouncedLimit]);

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Grid container spacing={2}>
                    <Grid item xs={12} md={12}>
                        <Pickers from={from} to={to} limit={limit} setFrom={setFrom} setTo={setTo} setLimit={setLimit} />
                    </ Grid>
                    <Grid item xs={12} md={12}>
                        <ChartContainer title="Income from flights" data={chartData} />
                    </ Grid>
                    <Grid item xs={12} md={8}>
                        <Stack spacing={2}>
                            <TableContainer title="Popular destinations" type={TableType.Destination} rows={popularDestinations} />
                            <TableContainer title="Popular flights" type={TableType.Route} rows={popularFlights} />
                        </Stack>
                    </Grid>
                    <Grid item xs={12} md={4} >
                        <Stack spacing={2} sx={{ display: "flex", flexDirection: "column" }} >
                            <Card amount={String(ticketsSold)} from={from?.format() ?? ""} to={to?.format() ?? ""} title={"Tickets Sold"} />
                            {totalEarnings.map((elem) => {
                                const title = formatTitle(elem.seat_type);
                                const amount = formatNumber(elem.value);
                                return (
                                    <Card key={elem.seat_type} amount={amount} from={from?.format() ?? ""} to={to?.format() ?? ""} title={title} />
                                );
                            }
                            )}
                        </Stack>
                    </Grid>
                </Grid>
            </LocalizationProvider>
        </Container>
    );
}

type PickersProps = {
    from: Dayjs | null,
    to: Dayjs | null,
    limit: number,
    setFrom: (date: Dayjs | null) => void,
    setTo: (date: Dayjs | null) => void,
    setLimit: (limit: number) => void;
};

function Pickers(props: PickersProps) {
    return (
        <Grid container spacing={2}>
            <Grid item xs={6} md={4} display="flex" justifyContent="center" >
                <DatePicker
                    label="From date"
                    value={props.from}
                    onChange={(newFrom) => props.setFrom(newFrom)}
                />
            </Grid>
            <Grid item xs={6} md={4} display="flex" justifyContent="center">
                <DatePicker
                    label="To date"
                    value={props.to}
                    onChange={(newTo) => props.setTo(newTo)}
                />
            </Grid>
            <Grid item xs={12} md={4} >
                <Stack direction="column" alignItems={"stretch"}>
                    <Typography >
                        Limit
                    </Typography>
                    <Slider step={10} value={props.limit} min={10} max={100} size="small"
                        valueLabelDisplay="auto"
                        onChange={(_: Event, newLimit: number | number[]) => {
                            props.setLimit(newLimit as number);
                        }}
                    />
                </Stack>
            </Grid>
        </Grid>
    );
}

function formatNumber(num: number): string {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(2) + "M PLN";
    } else if (num >= 1000) {
        return (num / 1000).toFixed(2) + "k PLN";
    } else {
        return num.toString() + " PLN";
    }
}

const formatTitle = (seat_type: string) => (
    `${seat_type.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())} Earnings`
);
