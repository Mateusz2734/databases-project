import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';


export function Card(props: { amount: string, from: string, to: string, title: string; }) {
    return (
        <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography sx={{ fontWeight: "bold" }} component="h2" variant="h6" color="dark" gutterBottom>
                {props.title}
            </Typography>
            <Typography component="p" variant="h4" color="primary.light">
                {props.amount}
            </Typography>
            <Typography color="text.secondary" sx={{ flex: 1 }}>
                from {props.from} to {props.to}
            </Typography>
        </Paper>
    );
}
