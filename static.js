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
     * Gets calendar dates relevant to UQ Lakes Station.
     * @returns {object} calendar dates relevant to UQ Lakes Station
     */
    async function getCalendarDates() {
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
         * 
         * @returns {object} calendar dates relevant to UQ Lakes Station
         */
        function filterCalendarDates(calendarDates) {
            return calendarDates.filter(calendarDate => true);
        }

        let calendarDates = await readFile("static/calendar_dates.txt");
        let parsedCalendarDates = parseCalendarDates(calendarDates.toString());
        return filterCalendarDates(parsedCalendarDates);
    }

    /**
     * Gets calendar relevant to UQ Lakes Station.
     * @returns {object} calendar relevant to UQ Lakes Station
     */
    async function getCalendar() {
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
         * @param {array} calendar all calendar from the static data
         * 
         * @returns {object} calendar relevant to UQ Lakes Station
         */
        function filterCalendar(calendar) {
            return calendar.filter(calendarEntry => true);
        }

        let calendar = await readFile("static/calendar.txt");
        let parsedCalendar = parseCalendar(calendar.toString());
        return filterCalendar(parsedCalendar);
    }

    /**
     * Gets routes relevant to UQ Lakes Station.
     * @returns {object} routes relevant to UQ Lakes Station
     */
    async function getRoutes() {
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
         * 
         * @returns {object} routes relevant to UQ Lakes Station
         */
        function filterRoutes(routes) {
            return routes.filter(route => true);
        }

        let routes = await readFile("static/routes.txt");
        let parsedRoutes = parseRoutes(routes.toString());
        return filterRoutes(parsedRoutes);
    }

    /**
     * Gets stop times relevant to UQ Lakes Station.
     * @returns {object} stop times relevant to UQ Lakes Station
     */
    async function getStopTimes() {
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
         * 
         * @returns {object} stop times relevant to UQ Lakes Station
         */
        function filterStopTimes(stopTimes) {
            return stopTimes.filter(stopTime => true);
        }

        let stopTimes = await readFile("static/stop_times.txt");
        let parsedStopTimes = parseStopTimes(stopTimes.toString());
        return filterStopTimes(parsedStopTimes);
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
     * Gets trips relevant to UQ Lakes Station.
     * @returns {object} trips relevant to UQ Lakes Station
     */
    async function getTrips() {
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
         * 
         * @returns {object} trips relevant to UQ Lakes Station
         */
        function filterCalendarDates(trips) {
            return trips.filter(trip => true);
        }

        let trips = await readFile("static/trips.txt");
        let parsedTrips = parseTrips(trips.toString());
        return filterCalendarDates(parsedTrips);
    }

    return {
        calendarDates: await getCalendarDates(),
        calendar: await getCalendar(),
        routes: await getRoutes(),
        stopTimes: await getStopTimes(),
        stops: await getStops(),
        trips: await getTrips()
    };
}
