let fetch = require("node-fetch");

async function getApiData() {
    let vehiclePositions = await fetch("http://127.0.0.1:5343/gtfs/seq/vehicle_positions.json");
    let tripUpdates = await fetch("http://127.0.0.1:5343/gtfs/seq/trip_updates.json");
    let alerts = await fetch("http://127.0.0.1:5343/gtfs/seq/alerts.json");

    return [vehiclePositions, tripUpdates, alerts];
}
