export default function HomePage() {
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <h1>What do you want to do?</h1>
            <p>
                <a href="/flights">Find a flight</a>
            </p>
            <p>
                <a href="/reservations">Manage reservations</a>
            </p>
            <p>
                <a href="/reports">View reports</a>
            </p>
        </div>
    );
}