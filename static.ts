import { readFile } from "fs/promises";
import { parse } from "csv-parse/sync";
import {
    Calendar,
    CalendarDates,
    Route,
    Stop,
    StopTime,
    Trip
} from "./gtfs-static.js";

export let UQ_LAKES_STOP_ID: Stop["stop_id"];


export async function getStaticData() {
    /**
     * Gets the options used to parse the static data.
     */
    function getParseOptions() {
        return {
            columns: true,
        };
    }

    /**
     * Gets stops relevant to UQ Lakes Station.
     * @returns {Promise<Array<Stop>>} stops relevant to UQ Lakes Station
     */
    async function getStops(): Promise<Array<Stop>> {
        /**
         * Parses a CSV string into an object.
         * 
         * @param {string} stops CSV string
         */
        function parseStops(stops: string) {
            let options = getParseOptions();
            return parse(stops, options)
        }

        /**
         * Filters stops to those relevant to UQ Lakes Station.
         * 
         * @param {Array<Stop>} stops all stops from the static data
         * 
         * @returns {Array<Stop>} stops relevant to UQ Lakes Station
         */
        function filterStops(stops: Array<Stop>): Array<Stop> {
            return stops.filter(stop =>
                stop.stop_name
                && /\.*UQ Lakes station\.*/.test(stop.stop_name)
                && /\d/.test(stop.stop_id));
        }

        let stops = await readFile("static-data/stops.txt");
        let parsedStops = parseStops(stops.toString());
        let result = filterStops(parsedStops);
        UQ_LAKES_STOP_ID = result[0].stop_id;
        return result;
    }

    /**
     * Gets stop times relevant to UQ Lakes Station.
     * 
     * @param {Array<Stop>} stops stops relevant to UQ Lakes Station
     * 
     * @returns {Promise<Array<StopTime>>} stop times relevant to UQ Lakes Station
     */
    async function getStopTimes(stops: Array<Stop>): Promise<Array<StopTime>> {
        /**
         * Parses a CSV string into an object.
         * 
         * @param {string} stopTimes CSV string
         */
        function parseStopTimes(stopTimes: string) {
            let options = getParseOptions();
            return parse(stopTimes, options)
        }

        /**
         * Filters stop times to those relevant to UQ Lakes Station.
         * 
         * @param {Array<StopTime>} stopTimes all stop times from the static data
         * @param {Array<Stop>} stops stops relevant to UQ Lakes Station
         * 
         * @returns {Array<StopTime>} stop times relevant to UQ Lakes Station
         */
        function filterStopTimes(stopTimes: Array<StopTime>, stops: Array<Stop>): Array<StopTime> {
            let stopIds = stops.map(stop => stop.stop_id);
            return stopTimes.filter(stopTime => stopIds.includes(stopTime.stop_id));
        }

        let stopTimesFile = await readFile("static-data/stop_times.txt");
        let parsedStopTimes = parseStopTimes(stopTimesFile.toString());
        return filterStopTimes(parsedStopTimes, stops);
    }

    /**
     * Gets trips relevant to UQ Lakes Station.
     * 
     * @param {Array<StopTime>} stopTimes stop times relevant to UQ Lakes Station
     * 
     * @returns {Promise<Array<Trip>>} trips relevant to UQ Lakes Station
     */
    async function getTrips(stopTimes: Array<StopTime>): Promise<Array<Trip>> {
        /**
         * Parses a CSV string into an object.
         * 
         * @param {string} trips CSV string
         */
        function parseTrips(trips: string) {
            let options = getParseOptions();
            return parse(trips, options)
        }

        /**
         * Filters trips to those relevant to UQ Lakes Station.
         * 
         * @param {Array<Trip>} trips all trips from the static data
         * @param {Array<StopTime>} stopTimes stop times relevant to UQ Lakes Station
         * 
         * @returns {Array<Trip>} trips relevant to UQ Lakes Station
         */
        function filterTrips(trips: Array<Trip>, stopTimes: Array<StopTime>): Array<Trip> {
            let tripIds = stopTimes.map(stopTime => stopTime.trip_id);
            return trips.filter(trip => tripIds.includes(trip.trip_id));
        }

        let tripsFile = await readFile("static-data/trips.txt");
        let parsedTrips = parseTrips(tripsFile.toString());
        return filterTrips(parsedTrips, stopTimes);
    }

    /**
     * Gets calendar dates relevant to UQ Lakes Station.
     * 
     * @param {Array<Trip>} trips trips relevant to UQ Lakes Station
     * 
     * @returns {Promise<Array<CalendarDates>>} calendar dates relevant to UQ Lakes Station
     */
    async function getCalendarDates(trips: Array<Trip>): Promise<Array<CalendarDates>> {
        /**
         * Parses a CSV string into an object.
         * 
         * @param {string} calendarDates CSV string
         */
        function parseCalendarDates(calendarDates: string) {
            let options = getParseOptions();
            return parse(calendarDates, options)
        }

        /**
         * Filters calendar dates to those relevant to UQ Lakes Station.
         * 
         * @param {Array<CalendarDates>} calendarDates all calendar dates from the static data
         * @param {Array<Trip>} trips trips relevant to UQ Lakes Station
         * 
         * @returns {Array<CalendarDates>} calendar dates relevant to UQ Lakes Station
         */
        function filterCalendarDates(calendarDates: Array<CalendarDates>, trips: Array<Trip>): Array<CalendarDates> {
            let serviceIds = trips.map(trip => trip.service_id);
            return calendarDates.filter(date => serviceIds.includes(date.service_id));
        }

        let calendarDates = await readFile("static-data/calendar_dates.txt");
        let parsedCalendarDates = parseCalendarDates(calendarDates.toString());
        return filterCalendarDates(parsedCalendarDates, trips);
    }

    /**
     * Gets calendar relevant to UQ Lakes Station.
     * 
     * @param {Array<Trip>} trips trips relevant to UQ Lakes Station
     * 
     * @returns {Promise<Array<Calendar>>} calendar relevant to UQ Lakes Station
     */
    async function getCalendar(trips: Array<Trip>): Promise<Array<Calendar>> {
        /**
         * Parses a CSV string into an object.
         * 
         * @param {string} calendar CSV string
         */
        function parseCalendar(calendar: string) {
            let options = getParseOptions();
            return parse(calendar, options)
        }

        /**
         * Filters calendar to those relevant to UQ Lakes Station.
         * 
         * @param {Array<Calendar>} calendar all services from the static data
         * @param {Array<Trip>} trips trips relevant to UQ Lakes Station
         * 
         * @returns {Array<Calendar>} calendar relevant to UQ Lakes Station
         */
        function filterCalendar(calendar: Array<Calendar>, trips: Array<Trip>): Array<Calendar> {
            let serviceIds = trips.map(trip => trip.service_id);
            return calendar.filter(service => serviceIds.includes(service.service_id));
        }

        let calendar = await readFile("static-data/calendar.txt");
        let parsedCalendar = parseCalendar(calendar.toString());
        return filterCalendar(parsedCalendar, trips);
    }

    /**
     * Gets routes relevant to UQ Lakes Station.
     * 
     * @param {Array<Trip>} trips trips relevant to UQ Lakes Station
     * 
     * @returns {Promise<Array<Route>>} routes relevant to UQ Lakes Station
     */
    async function getRoutes(trips: Array<Trip>): Promise<Array<Route>> {
        /**
         * Parses a CSV string into an object.
         * 
         * @param {string} routes CSV string
         */
        function parseRoutes(routes: string) {
            let options = getParseOptions();
            return parse(routes, options)
        }

        /**
         * Filters routes to those relevant to UQ Lakes Station.
         * 
         * @param {Array<Route>} routes all routes from the static data
         * @param {Array<Trip>} trips trips relevant to UQ Lakes Station
         * 
         * @returns {Array<Route>} routes relevant to UQ Lakes Station
         */
        function filterRoutes(routes: Array<Route>, trips: Array<Trip>): Array<Route> {
            let routeIds = trips.map(trip => trip.route_id);
            return routes.filter(route => routeIds.includes(route.route_id));
        }

        let routes = await readFile("static-data/routes.txt");
        let parsedRoutes = parseRoutes(routes.toString());
        return filterRoutes(parsedRoutes, trips);
    }

    let stops = await getStops();
    let stopTimes = await getStopTimes(stops);
    let trips = await getTrips(stopTimes);
    let calendarDates = await getCalendarDates(trips);
    let calendar = await getCalendar(trips);
    let routes = await getRoutes(trips);

    return { stops, stopTimes, trips, calendarDates, calendar, routes };
}
