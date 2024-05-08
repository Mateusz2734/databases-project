import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

import { Chart } from './Chart';
import { DataTable } from './DataTable';
import { DestinationPopularity, TableType } from '../types';

export function ChartContainer(props: { title: string, data: number[][]; }) {
    return (
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h2" variant="h6" color="dark" sx={{ fontWeight: "bold" }} >
                {props.title}
            </Typography>
            <Chart chartData={props.data} />
        </Paper>
    );
}

export function TableContainer(props: { title: string, type: TableType, rows: DestinationPopularity[]; }) {
    return (
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h2" variant="h6" color="dark" sx={{ fontWeight: "bold" }} >
                {props.title}
            </Typography>
            <DataTable rows={props.rows} type={props.type} />
        </Paper>
    );
}