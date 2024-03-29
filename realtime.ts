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
    vehicle: VehiclePosition;
}


/**
 * Gets data from the API.
 * 
 * @param {Array<string>} routeIds route IDs relevant to UQ Lakes station
 * 
 * @returns {Promise<Array<Array<Alert>, Array<TripUpdate>, Array<VehiclePosition>>>} Promise that resolves to an array of three arrays: alerts, trip updates, and vehicle positions.
 */
async function getApiData(routeIds: Array<string>): Promise<any> {
    /**
     * Gets alerts relevant to UQ Lakes Station.
     * 
     * @param {Array<string>} routeIds route IDs relevant to UQ Lakes station
     * 
     * @returns {Promise<Array<Alert>>} alerts relevant to UQ Lakes Station
     */
    async function getAlerts(routeIds: Array<string>): Promise<Array<Alert>> {
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
         * @param {Array<string>} routeIds route IDs relevant to UQ Lakes station
         * 
         * @returns {Array<Alert>} alerts relevant to UQ Lakes Station
         */
        function filterAlerts(alerts: Array<Alert>, routeIds: Array<string>): Array<Alert> {
            return alerts.filter(alert => {
                let alertRouteIds = alert.informedEntity.map(entity => entity.routeId);
                return routeIds.some(routeId => alertRouteIds.includes(routeId))
            });
        }

        let response = await fetch(API_DOMAIN + "alerts.json");
        let buffer = await response.arrayBuffer();
        let decoded = new TextDecoder().decode(buffer);
        let jsonified = JSON.parse(decoded);
        let entity = jsonified.entity;
        let alerts = extractAlerts(entity);

        return filterAlerts(alerts, routeIds);
    }

    /**
     * Gets trip updates relevant to UQ Lakes Station.
     * 
     * @param {Array<string>} routeIds route IDs relevant to UQ Lakes station
     * 
     * @returns {Promise<Array<TripUpdate>>} trip updates relevant to UQ Lakes Station
     */
    async function getTripUpdates(routeIds: Array<string>): Promise<Array<TripUpdate>> {
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
         * @param {Array<string>} routeIds route IDs relevant to UQ Lakes station
         * 
         * @returns {Array<TripUpdate>} trip updates relevant to UQ Lakes Station
         */
        function filterTripUpdates(tripUpdates: Array<TripUpdate>, routeIds: Array<string>): Array<TripUpdate> {
            return tripUpdates.filter(tripUpdate => tripUpdate.trip.routeId && routeIds.includes(tripUpdate.trip.routeId));
        }

        let response = await fetch(API_DOMAIN + "trip_updates.json");
        let buffer = await response.arrayBuffer();
        let decoded = new TextDecoder().decode(buffer);
        let jsonified = JSON.parse(decoded);
        let entity = jsonified.entity;
        let tripUpdates = extractTripUpdates(entity);

        return filterTripUpdates(tripUpdates, routeIds);
    }

    /**
     * Gets vehicle positions relevant to UQ Lakes Station.
     * 
     * @param {Array<string>} routeIds route IDs relevant to UQ Lakes station
     * 
     * @returns {Promise<Array<VehiclePosition>>} vehicle positions relevant to UQ Lakes Station
     */
    async function getVehiclePositions(routeIds: Array<string>): Promise<Array<VehiclePosition>> {
        /**
         * Extracts the vehicle positions from the API objects.
         * 
         * @param {Array<APIVehiclePosition>} vehiclePositions raw vehicle positions with IDs from the API
         * 
         * @returns {Array<VehiclePosition>} extracted vehicle positions
         */
        function extractVehiclePositions(vehiclePositions: Array<APIVehiclePosition>): Array<VehiclePosition> {
            return vehiclePositions.map(vehiclePosition => vehiclePosition.vehicle);
        }

        /**
         * Filters vehicle positions to those relevant to UQ Lakes Station.
         * 
         * @param {Array<VehiclePosition>} vehiclePositions all vehicle positions from the API
         * @param {Array<string>} routeIds route IDs relevant to UQ Lakes station
         * 
         * @returns {Array<VehiclePosition>} vehicle positions relevant to UQ Lakes Station
         */
        function filterVehiclePositions(vehiclePositions: Array<VehiclePosition>, routeIds: Array<string>): Array<VehiclePosition> {
            return vehiclePositions.filter(vehiclePosition =>
                vehiclePosition.trip?.routeId
                && routeIds.includes(vehiclePosition.trip?.routeId)
            );
        }

        let response = await fetch(API_DOMAIN + "vehicle_positions.json");
        let buffer = await response.arrayBuffer();
        let decoded = new TextDecoder().decode(buffer);
        let jsonified = JSON.parse(decoded);
        let entity = jsonified.entity;
        let vehiclePositions = extractVehiclePositions(entity);

        return filterVehiclePositions(vehiclePositions, routeIds);
    }

    let alerts = await getAlerts(routeIds);
    let tripUpdates = await getTripUpdates(routeIds);
    let vehiclePositions = await getVehiclePositions(routeIds);

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


export async function main(routeIds: Array<string>) {
    let data = await getApiData(routeIds);
    let [alerts, tripUpdates, vehiclePositions] = data;
    writeApiData(alerts, tripUpdates, vehiclePositions);

    return [alerts, tripUpdates, vehiclePositions];
}
