import { useState } from 'react';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';

import { RoutePopularity, DestinationPopularity, TableType } from '../types';

interface Column {
    id: keyof RoutePopularity | keyof DestinationPopularity;
    label: string;
    minWidth?: number;
    align?: 'right';
    format?: (value: number) => string;
}

const columnsRoute: readonly Column[] = [
    { id: 'departure_airport', label: 'Departure Airport', minWidth: 80 },
    { id: 'arrival_airport', label: 'Arrival Airport', minWidth: 80 },
    {
        id: 'seat_count',
        label: 'Tickets sold',
        minWidth: 80,
        format: (value: number) => value.toLocaleString('pl-PL'),
    }
];

const columnsDest: readonly Column[] = [
    { id: 'arrival_airport', label: 'Destination Airport', minWidth: 80 },
    {
        id: 'seat_count',
        label: 'Tickets sold',
        minWidth: 80,
        format: (value: number) => value.toLocaleString('pl-PL'),
    }

];

export function DataTable(props: { rows: RoutePopularity[] | DestinationPopularity[], type: TableType; }) {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    return (
        <Paper sx={{ width: '100%', overflow: 'hidden', margin: "0 10px" }}>
            <TableContainer sx={{ maxHeight: 440 }}>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            {(props.type === TableType.Route ? columnsRoute : columnsDest).map((column) => (
                                <TableCell
                                    key={column.id}
                                    align={column.align}
                                    style={{ minWidth: column.minWidth, fontWeight: 'bold' }}
                                >
                                    {column.label}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {props.rows
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row, id) => {
                                return (
                                    <TableRow hover key={id}>
                                        {(props.type === TableType.Route ? columnsRoute : columnsDest).map((column) => {
                                            // @ts-ignore
                                            const value = row[column.id];
                                            return (
                                                <TableCell key={column.id} align={column.align}>
                                                    {column.format && typeof value === 'number'
                                                        ? column.format(value)
                                                        : value}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={props.rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Paper>
    );
}