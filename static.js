import { readFile } from "fs/promises";
import { parse } from "csv-parse/sync";


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
     * @returns {object} stops relevant to UQ Lakes Station
     */
    async function getStops() {
        /**
         * Parses a CSV string into an object.
         * 
         * @param {string} stops CSV string
         */
        function parseStops(stops) {
            let options = getParseOptions();
            return parse(stops, options)
        }

        /**
         * Filters stops to those relevant to UQ Lakes Station.
         * 
         * @param {array} stops all stops from the static data
         * 
         * @returns {object} stops relevant to UQ Lakes Station
         */
        function filterStops(stops) {
            return stops.filter(stop => /\.*UQ Lakes\.*/.test(stop.stop_name));
        }

        let stops = await readFile("static/stops.txt");
        let parsedStops = parseStops(stops.toString());
        return filterStops(parsedStops);
    }

    /**
     * Gets stop times relevant to UQ Lakes Station.
     * 
     * @param {array} stops stops relevant to UQ Lakes Station
     * 
     * @returns {object} stop times relevant to UQ Lakes Station
     */
    async function getStopTimes(stops) {
        /**
         * Parses a CSV string into an object.
         * 
         * @param {string} stopTimes CSV string
         */
        function parseStopTimes(stopTimes) {
            let options = getParseOptions();
            return parse(stopTimes, options)
        }

        /**
         * Filters stop times to those relevant to UQ Lakes Station.
         * 
         * @param {array} stopTimes all stop times from the static data
         * @param {array} stops stops relevant to UQ Lakes Station
         * 
         * @returns {object} stop times relevant to UQ Lakes Station
         */
        function filterStopTimes(stopTimes, stops) {
            let stopIds = stops.map(stop => stop.stop_id);
            return stopTimes.filter(stopTime => stopIds.includes(stopTime.stop_id));
        }

        let stopTimes = await readFile("static/stop_times.txt");
        let parsedStopTimes = parseStopTimes(stopTimes.toString());
        return filterStopTimes(parsedStopTimes, stops);
    }

    /**
     * Gets trips relevant to UQ Lakes Station.
     * 
     * @param {array} stopTimes stop times relevant to UQ Lakes Station
     * 
     * @returns {object} trips relevant to UQ Lakes Station
     */
    async function getTrips(stopTimes) {
        /**
         * Parses a CSV string into an object.
         * 
         * @param {string} trips CSV string
         */
        function parseTrips(trips) {
            let options = getParseOptions();
            return parse(trips, options)
        }

        /**
         * Filters trips to those relevant to UQ Lakes Station.
         * 
         * @param {array} trips all trips from the static data
         * @param {array} stopTimes stop times relevant to UQ Lakes Station
         * 
         * @returns {object} trips relevant to UQ Lakes Station
         */
        function filterTrips(trips, stopTimes) {
            let tripIds = stopTimes.map(stopTime => stopTime.trip_id);
            return trips.filter(trip => tripIds.includes(trip.trip_id));
        }

        let trips = await readFile("static/trips.txt");
        let parsedTrips = parseTrips(trips.toString());
        return filterTrips(parsedTrips, stopTimes);
    }

    /**
     * Gets calendar dates relevant to UQ Lakes Station.
     * 
     * @param {array} trips trips relevant to UQ Lakes Station
     * 
     * @returns {object} calendar dates relevant to UQ Lakes Station
     */
    async function getCalendarDates(trips) {
        /**
         * Parses a CSV string into an object.
         * 
         * @param {string} calendarDates CSV string
         */
        function parseCalendarDates(calendarDates) {
            let options = getParseOptions();
            return parse(calendarDates, options)
        }

        /**
         * Filters calendar dates to those relevant to UQ Lakes Station.
         * 
         * @param {array} calendarDates all calendar dates from the static data
         * @param {array} trips trips relevant to UQ Lakes Station
         * 
         * @returns {object} calendar dates relevant to UQ Lakes Station
         */
        function filterCalendarDates(calendarDates, trips) {
            let serviceIds = trips.map(trip => trip.service_id);
            return calendarDates.filter(date => serviceIds.includes(date.service_id));
        }

        let calendarDates = await readFile("static/calendar_dates.txt");
        let parsedCalendarDates = parseCalendarDates(calendarDates.toString());
        return filterCalendarDates(parsedCalendarDates, trips);
    }

    /**
     * Gets calendar relevant to UQ Lakes Station.
     * 
     * @param {array} trips trips relevant to UQ Lakes Station
     * 
     * @returns {object} calendar relevant to UQ Lakes Station
     */
    async function getCalendar(trips) {
        /**
         * Parses a CSV string into an object.
         * 
         * @param {string} calendar CSV string
         */
        function parseCalendar(calendar) {
            let options = getParseOptions();
            return parse(calendar, options)
        }

        /**
         * Filters calendar to those relevant to UQ Lakes Station.
         * 
         * @param {array} calendar all services from the static data
         * @param {array} trips trips relevant to UQ Lakes Station
         * 
         * @returns {object} calendar relevant to UQ Lakes Station
         */
        function filterCalendar(calendar, trips) {
            let serviceIds = trips.map(trip => trip.service_id);
            return calendar.filter(service => serviceIds.includes(service.service_id));
        }

        let calendar = await readFile("static/calendar.txt");
        let parsedCalendar = parseCalendar(calendar.toString());
        return filterCalendar(parsedCalendar, trips);
    }

    /**
     * Gets routes relevant to UQ Lakes Station.
     * 
     * @param {array} trips trips relevant to UQ Lakes Station
     * 
     * @returns {object} routes relevant to UQ Lakes Station
     */
    async function getRoutes(trips) {
        /**
         * Parses a CSV string into an object.
         * 
         * @param {string} routes CSV string
         */
        function parseRoutes(routes) {
            let options = getParseOptions();
            return parse(routes, options)
        }

        /**
         * Filters routes to those relevant to UQ Lakes Station.
         * 
         * @param {array} routes all routes from the static data
         * @param {array} trips trips relevant to UQ Lakes Station
         * 
         * @returns {object} routes relevant to UQ Lakes Station
         */
        function filterRoutes(routes, trips) {
            let routeIds = trips.map(trip => trip.route_id);
            return routes.filter(route => routeIds.includes(route.route_id));
        }

        let routes = await readFile("static/routes.txt");
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
