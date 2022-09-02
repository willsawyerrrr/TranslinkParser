import fetch from "node-fetch";
import fs from "fs";
import { Alert, TripUpdate, VehiclePosition } from "./gtfs-realtime.js";


const API_DOMAIN = "http://127.0.0.1:5343/gtfs/seq/";

interface APIAlert {
    id: string;
    alert: Alert;
}

interface APITripUpdate {
    id: string;
    tripUpdate: TripUpdate;
}

interface APIVehiclePosition {
    id: string;
    vehiclePositon: VehiclePosition;
}


/**
 * Gets data from the API.
 * 
 * @returns {Promise<Array<Array<Alert>, Array<TripUpdate>, Array<VehiclePosition>>>} Promise that resolves to an array of three arrays: alerts, trip updates, and vehicle positions.
 */
async function getApiData(): Promise<any> {
    /**
     * Gets alerts relevant to UQ Lakes Station.
     * 
     * @returns {Promise<Array<Alert>>} alerts relevant to UQ Lakes Station
     */
    async function getAlerts(): Promise<Array<Alert>> {
        /**
         * Extracts the alerts from the API objects.
         * 
         * @param {Array<APIAlert>} alerts raw alerts with IDs from the API
         * 
         * @returns {Array<Alert>} extracted alerts
         */
        function extractAlerts(alerts: Array<APIAlert>): Array<Alert> {
            return alerts.map(alert => alert.alert);
        }

        /**
         * Filters alerts to those relevant to UQ Lakes Station.
         * 
         * @param {Array<Alert>} alerts all alerts from the API
         * 
         * @returns {Array<Alert>} alerts relevant to UQ Lakes Station
         */
        function filterAlerts(alerts: Array<Alert>): Array<Alert> {
            return alerts.filter(alert => true);
        }

        let response = await fetch(API_DOMAIN + "alerts.json");
        let buffer = await response.arrayBuffer();
        let decoded = new TextDecoder().decode(buffer);
        let jsonified = JSON.parse(decoded);
        let entity = jsonified.entity;
        let alerts = extractAlerts(entity);

        return filterAlerts(alerts);
    }

    /**
     * Gets trip updates relevant to UQ Lakes Station.
     * @returns {Promise<Array<TripUpdate>>} trip updates relevant to UQ Lakes Station
     */
    async function getTripUpdates(): Promise<Array<TripUpdate>> {
        /**
         * Extracts the trip updates from the API objects.
         * 
         * @param {Array<APITripUpdate>} tripUpdates raw trip updates with IDs from the API
         * 
         * @returns {Array<TripUpdate>} extracted trip updates
         */
        function extractTripUpdates(tripUpdates: Array<APITripUpdate>): Array<TripUpdate> {
            return tripUpdates.map(tripUpdate => tripUpdate.tripUpdate);
        }

        /**
         * Filters trip updates to those relevant to UQ Lakes Station.
         * 
         * @param {Array<TripUpdate>} tripUpdates all trip updates from the API
         * 
         * @returns {Array<TripUpdate>} trip updates relevant to UQ Lakes Station
         */
        function filterTripUpdates(tripUpdates: Array<TripUpdate>): Array<TripUpdate> {
            return tripUpdates.filter(tripUpdate => true);
        }

        let response = await fetch(API_DOMAIN + "trip_updates.json");
        let buffer = await response.arrayBuffer();
        let decoded = new TextDecoder().decode(buffer);
        let jsonified = JSON.parse(decoded);
        let entity = jsonified.entity;
        let tripUpdates = extractTripUpdates(entity);

        return filterTripUpdates(tripUpdates);
    }

    /**
     * Gets vehicle positions relevant to UQ Lakes Station.
     * @returns {Promise<Array<VehiclePosition>>} vehicle positions relevant to UQ Lakes Station
     */
    async function getVehiclePositions(): Promise<Array<VehiclePosition>> {
        /**
         * Extracts the vehicle positions from the API objects.
         * 
         * @param {Array<APIVehiclePosition>} vehiclePositions raw vehicle positions with IDs from the API
         * 
         * @returns {Array<VehiclePosition>} extracted vehicle positions
         */
        function extractVehiclePositions(vehiclePositions: Array<APIVehiclePosition>): Array<VehiclePosition> {
            return vehiclePositions.map(vehiclePosition => vehiclePosition.vehiclePositon);
        }

        /**
         * Filters vehicle positions to those relevant to UQ Lakes Station.
         * 
         * @param {Array<VehiclePosition>} vehiclePositions all vehicle positions from the API
         * 
         * @returns {Array<VehiclePosition>} vehicle positions relevant to UQ Lakes Station
         */
        function filterVehiclePositions(vehiclePositions: Array<VehiclePosition>): Array<VehiclePosition> {
            return vehiclePositions.filter(vehiclePosition => true);
        }

        let response = await fetch(API_DOMAIN + "vehicle_positions.json");
        let buffer = await response.arrayBuffer();
        let decoded = new TextDecoder().decode(buffer);
        let jsonified = JSON.parse(decoded);
        let entity = jsonified.entity;
        let vehiclePositions = extractVehiclePositions(entity);

        return filterVehiclePositions(vehiclePositions);
    }

    let alerts = await getAlerts();
    let tripUpdates = await getTripUpdates();
    let vehiclePositions = await getVehiclePositions();

    return [alerts, tripUpdates, vehiclePositions];
}


/**
 * Writes API data to local cached files.
 * 
 * @param {Array<Alert>} alerts alerts to write to the cache
 * @param {Array<TripUpdate>} tripUpdates alerts to write to the cache
 * @param {Array<VehiclePosition>} vehiclePositions alerts to write to the cache
 */
async function writeApiData(alerts: Array<Alert>, tripUpdates: Array<TripUpdate>, vehiclePositions: Array<VehiclePosition>) {
    /** Callback function used to log errors. */
    const logError = (error: any) => { if (error) console.log(error); };

    type APIEntity = Alert | TripUpdate | VehiclePosition;

    /**
     * Writes the entity to the local cached file specified by filename.
     * 
     * @param {string} filename name of the file to write to
     * @param {Array<APIEntity>} entity entity to write to the file
     */
    async function writeApiDataHelper(filename: string, entity: Array<APIEntity>) {
        fs.writeFile(`cached-data/${filename}.json`,
            JSON.stringify(entity, null, 4),
            logError
        );
    }

    await writeApiDataHelper("alerts", alerts);
    await writeApiDataHelper("trip_updates", tripUpdates);
    await writeApiDataHelper("vehicle_positions", vehiclePositions);
}


export async function main() {
    let data = await getApiData();
    let [alerts, tripUpdates, vehiclePositions] = data;
    writeApiData(alerts, tripUpdates, vehiclePositions);

    return [alerts, tripUpdates, vehiclePositions];
}
