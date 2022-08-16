import fetch from "node-fetch";
import fs from "fs";


/**
 * Gets data from the API.
 * 
 * @returns {Promise} Promise that resolves to an array of three objects: alerts, trip updates, and vehicle positions.
 */
async function getApiData() {
    /**
     * Gets alerts relevant to UQ Lakes Station.
     * @returns {object} alerts relevant to UQ Lakes Station
     */
    async function getAlerts() {
        let response = await fetch("http://127.0.0.1:5343/gtfs/seq/alerts.json");
        let data = await response.json();
        let entity = data.entity;

        /**
         * Filters alerts to those relevant to UQ Lakes Station.
         * 
         * @param {object} alerts all alerts from the API
         * 
         * @returns {object} alerts relevant to UQ Lakes Station
         */
        function filterAlerts(alerts) {
            return alerts.filter(alert => true);
        }

        return filterAlerts(entity);
    }

    /**
     * Gets trip updates relevant to UQ Lakes Station.
     * @returns {object} trip updates relevant to UQ Lakes Station
     */
    async function getTripUpdates() {
        let response = await fetch("http://127.0.0.1:5343/gtfs/seq/trip_updates.json");
        let data = await response.json();
        let entity = data.entity;

        /**
         * Filters trip updates to those relevant to UQ Lakes Station.
         * 
         * @param {object} alerts all trip updates from the API
         * 
         * @returns {object} trip updates relevant to UQ Lakes Station
         */
        function filterTripUpdates(tripUpdates) {
            return tripUpdates.filter(tripUpdate => true);
        }

        return filterTripUpdates(entity);
    }

    /**
     * Gets vehicle positions relevant to UQ Lakes Station.
     * @returns {object} vehicle positions relevant to UQ Lakes Station
     */
    async function getVehiclePositions() {
        let response = await fetch("http://127.0.0.1:5343/gtfs/seq/vehicle_positions.json");
        let data = await response.json();
        let entity = data.entity;

        /**
         * Filters vehicle positions to those relevant to UQ Lakes Station.
         * 
         * @param {object} alerts all vehicle positions from the API
         * 
         * @returns {object} vehicle positions relevant to UQ Lakes Station
         */
        function filterVehiclePositions(vehiclePositions) {
            return vehiclePositions.filter(vehiclePosition => true);
        }

        return filterVehiclePositions(entity);
    }

    let alerts = await getAlerts();
    let tripUpdates = await getTripUpdates();
    let vehiclePositions = await getVehiclePositions();

    return [alerts, tripUpdates, vehiclePositions];
}


/**
 * Writes API data to local cached files.
 */
function writeApiData(alerts, tripUpdates, vehiclePositions) {
    /** Callback function used to log errors. */
    const logError = (error) => { if (error) console.log(error) };

    /** Writes the entity to a local cached file. */
    function writeApiDataType(filename, entity) {
        fs.writeFile(`cache/${filename}.json`,
            JSON.stringify(entity, null, 4),
            logError
        );
    }

    writeApiDataType("alerts", alerts);
    writeApiDataType("trip_updates", tripUpdates);
    writeApiDataType("vehicle_positions", vehiclePositions);
}


export async function main() {
    let data = await getApiData();
    writeApiData(data[0], data[1], data[2]);
}

main();