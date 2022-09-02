import { main as retrieveApiData } from "./realtime.js";
import { getStaticData, UQ_LAKES_STOP_ID } from "./static.js";

import prompt from "prompt";
import { Calendar, CalendarDates, Route, Stop, StopTime, Trip } from "./gtfs-static.js";
import { Alert, TripUpdate, VehiclePosition } from "./gtfs-realtime.js";
prompt.message = "";
prompt.delimiter = "";
prompt.colors = false;

const MAX_FAILED_ATTEMPTS = 4;

let alerts: Array<Alert>;
let calendarDates: Array<CalendarDates>;
let calendar: Array<Calendar>;
let routes: Array<Route>;
let stops: Array<Stop>;
let stopTimes: Array<StopTime>;
let trips: Array<Trip>;
let tripUpdates: Array<TripUpdate>;
let vehiclePositions: Array<VehiclePosition>;

interface PromptSchema {
    properties: {
        property: {
            description: string;
        };
    };
}

interface Result {
    "Route Short Name": string;
    "Route Long Name": string;
    "Service ID": string;
    "Headsign": string;
    "Scheduled Arrival Time": string;
    "Live Arrival Time": string;
    "Live Position": string;
}

interface StaticResult {
    routeShortName: string;
    routeLongName: string;
    serviceId: string;
    tripId: string;
    headsign: string;
    scheduledArrivalTime: {
        hour: number;
        minute: number;
    };
}

interface Time {
    hour: number;
    minute: number;
}

/**
 * Main program loop.
 * 
 * @param {boolean} [welcome = true] whether to output the welcome message
 */
async function main(welcome: boolean = true) {
    if (welcome) {
        console.log("Welcome to the UQ Lakes station bus tracker!");
    }

    let date = await getDate();
    let time = await getTime();

    // filter data
    let filteredStaticData = filterStaticData(date, time);
    let output = incorporateApiData(filteredStaticData);
    // output data
    console.table(output);

    if (await getAgain()) {
        await main(false);
    } else {
        console.log("Thanks for using the UQ Lakes Station bus tracker!");
        process.exit(0);
    }
}

/**
 * Returns the prompt schema required to get the information specified by
 * `purpose`.
 * 
 * @param {string} purpose information to be collected
 * 
 * @returns {PromptSchema} prompt schema
 */
function getPromptSchema(purpose: string): PromptSchema {
    let description = (purpose == "again")
        ? "Would you like to search again?"
        : `What ${purpose} will you depart UQ Lakes station by bus? `;

    return {
        properties: {
            property: {
                description: description
            }
        },
    };
}


/**
 * Prompts the user for the departure date to search.
 * 
 * @param {number} [attempts = 0] number of previously failed attempts
 * @param {string} [previous = ""] previous invalid date string
 * 
 * @returns {Promise<Date>} date entered by the user
 */
async function getDate(attempts: number = 0, previous: string = ""): Promise<Date> {
    if (attempts) {
        console.log(`    "${previous}" is not a valid date.`)

        if (attempts === MAX_FAILED_ATTEMPTS) {
            console.log("    You failed to enter a valid date.");
            process.exit(1);
        } else {
            console.log("    Please enter a date in YYYY-MM-DD format.")
        }
    }

    let promptResult = await prompt.get(getPromptSchema("date"));
    let date = promptResult.property as string;

    if (new Date(date).toString() != "Invalid Date") {
        return new Date(date);
    }

    return await getDate(++attempts, date);
}


/**
 * Prompts the user for the departure time to search.
 * 
 * @param {number} [attempts = 0] number of previously failed attempts
 * @param {string} [previous = ""] previous invalid time string
 * 
 * @returns {Promise<Time>} time entered by the user
 */
async function getTime(attempts: number = 0, previous: string = ""): Promise<Time> {
    /**
     * Determines whether the given string represents a valid time.
     * 
     * @param {string} time time string to validate
     * 
     * @returns {boolean} `true` if the time string is valid; `false` otherwise
     */
    function validateTime(time: string): boolean {
        /**
         * Determines whether the given string is of the correct format.
         * 
         * @param {string} time time string to validate
         */
        let validateTimeFormat = (time: string) => /^\d{2}:\d{2}$/.test(time);

        /**
         * Determines whether each component of the given time string is valid.
         * 
         * @param {string[]} components components of the time string
         * 
         * @returns {boolean} `true` if the components are valid; `false` otherwise
         */
        function validateTimeComponents(components: string[]): boolean {
            let integerComponents = components.map(component => parseInt(component));
            let [hour, minute] = integerComponents;
            return hour >= 0 && hour <= 23
                && minute >= 0 && minute <= 59;
        }

        return validateTimeFormat(time) && validateTimeComponents(time.split(":"));
    }

    if (attempts) {
        console.log(`    "${previous}" is not a valid time.`)

        if (attempts === MAX_FAILED_ATTEMPTS) {
            console.log("    You failed to enter a valid time.");
            process.exit(1);
        } else {
            console.log("    Please enter a time in HH:mm format.")
        }
    }

    let result = await prompt.get(getPromptSchema("time"));
    let time = result.property as string;

    if (validateTime(time)) {
        return {
            hour: parseInt(time.substring(0, 2)),
            minute: parseInt(time.substring(3))
        };
    }

    return await getTime(++attempts, time);
}


/**
 * Filters the static data to only include buses that arrive within 10 minutes
 * of the given time.
 * 
 * @param {Date} date date by which to filter for arriving buses
 * @param {Time} time time by which to filter for arriving buses
 * 
 * @returns {Array<StaticResult>} required data for buses arriving within 10 minutes of the
 * given time
 */
function filterStaticData(date: Date, time: Time): Array<StaticResult> {
    /**
     * Parses the given date string into an object with hour and minute
     * properties.
     * 
     * @param {string} time time string in HH-mm format
     * 
     * @returns {Time} parsed time
     */
    function parseTime(time: string): Time {
        return {
            hour: parseInt(time.substring(0, 2)),
            minute: parseInt(time.substring(3, 5))
        };
    }

    /**
     * Returns the number of minutes that elapse from `userTime` to `stopTime`.
     * 
     * @param {Time} userTime time to search from
     * @param {Time} stopTime arrival time of the bus
     * 
     * @returns {number} number of minutes that elapse from `userTime` to `stopTime`
     */
    function timeDiff(userTime: Time, stopTime: Time): number {
        return (stopTime.hour - userTime.hour) * 60 + (stopTime.minute - userTime.minute);
    }

    let filteredServiceIds: Array<string>;
    switch (date.getDay()) {
        case 0:
            filteredServiceIds = calendar.filter(calendarEntry => calendarEntry.sunday)
                .map(calendarEntry => calendarEntry.service_id);
            break;
        case 1:
            filteredServiceIds = calendar.filter(calendarEntry => calendarEntry.monday)
                .map(calendarEntry => calendarEntry.service_id);
            break;
        case 2:
            filteredServiceIds = calendar.filter(calendarEntry => calendarEntry.tuesday)
                .map(calendarEntry => calendarEntry.service_id);
            break;
        case 3:
            filteredServiceIds = calendar.filter(calendarEntry => calendarEntry.wednesday)
                .map(calendarEntry => calendarEntry.service_id);
            break;
        case 4:
            filteredServiceIds = calendar.filter(calendarEntry => calendarEntry.thursday)
                .map(calendarEntry => calendarEntry.service_id);
            break;
        case 5:
            filteredServiceIds = calendar.filter(calendarEntry => calendarEntry.friday)
                .map(calendarEntry => calendarEntry.service_id);
            break;
        case 6:
            filteredServiceIds = calendar.filter(calendarEntry => calendarEntry.saturday)
                .map(calendarEntry => calendarEntry.service_id);
            break;
        default:
            throw new Error("Invalid date.");
    }

    let filteredTrips = trips.filter(trip => filteredServiceIds.includes(trip.service_id));
    let filteredTripIds = filteredTrips.map(trip => trip.trip_id);
    let filteredRouteIds = filteredTrips.map(trip => trip.route_id);
    let filteredRoutes = routes.filter(route => filteredRouteIds.includes(route.route_id));

    let filteredStopTimes = stopTimes.filter(stopTime => filteredTripIds.includes(stopTime.trip_id))
        .filter(stopTime => {
            // if it terminates at this stop, don't suggest it
            if (!stopTime.departure_time) return false;

            // if it is already in transit, use its arrival time
            if (stopTime.arrival_time) {
                let arrivalTime = parseTime(stopTime.arrival_time);
                let diff = timeDiff(time, arrivalTime);
                return diff >= 0 && diff <= 10;
            }

            // if it begins at this stop, use its departure time
            let departureTime = parseTime(stopTime.departure_time);
            let diff = timeDiff(time, departureTime);
            return diff >= 0 && diff <= 10;
        });


    let result: Array<StaticResult> = [];

    for (let stop of filteredStopTimes) {
        if (!stop.arrival_time) continue;

        let trip = filteredTrips.find(trip => trip.trip_id === stop.trip_id);
        if (!(trip?.route_id && trip?.service_id
            && trip?.trip_headsign && trip?.trip_id)) continue;

        let route = filteredRoutes.find(route => trip && route.route_id === trip.route_id);
        if (!(route?.route_short_name && route?.route_long_name)) continue;

        result.push(
            {
                routeShortName: route.route_short_name,
                routeLongName: route.route_long_name,
                serviceId: trip.service_id,
                tripId: trip.trip_id,
                headsign: trip.trip_headsign,
                scheduledArrivalTime: parseTime(stop.arrival_time)
            }
        );
    }

    // sort by time
    result.sort((a, b) => a.scheduledArrivalTime.minute - b.scheduledArrivalTime.minute);
    result.sort((a, b) => a.scheduledArrivalTime.hour - b.scheduledArrivalTime.hour);

    return result;
}


/**
 * Incorporates live data into the given static data.
 * 
 * @param {Array<StaticResult>} filteredStaticData information on relevant buses
 * 
 * @returns {Array<Result>} information on relevant buses, including live data
 */
function incorporateApiData(filteredStaticData: Array<StaticResult>): Array<Result> {
    return filteredStaticData.map(arrival => {
        let tripUpdate: TripUpdate | undefined = tripUpdates.find(tripUpdate => tripUpdate.trip.tripId === arrival.tripId);
        let arrivalTime = undefined;
        if (tripUpdate?.stopTimeUpdate) {
            let stopTimeUpdate = tripUpdate.stopTimeUpdate.find(update => update.stopId === UQ_LAKES_STOP_ID);
            if (stopTimeUpdate?.arrival?.time) {
                arrivalTime = new Date(parseInt(stopTimeUpdate.arrival.time));
            }
        }

        let vehiclePosition = vehiclePositions.find(position => position?.trip?.tripId === arrival.tripId);

        return {
            ...arrival,
            liveArrivalTime: (!arrivalTime) ? null : {
                hour: arrivalTime.getHours(),
                minute: arrivalTime.getMinutes()
            },
            livePosition: (!vehiclePosition) ? null : {
                latitude: vehiclePosition?.position?.latitude,
                longitude: vehiclePosition?.position?.longitude
            }
        };
    }).map(arrival => (
        // stringify live arrival time
        {
            ...arrival,
            scheduledArrivalTime: `${arrival.scheduledArrivalTime.hour}:${arrival.scheduledArrivalTime.minute}`,
            liveArrivalTime: (!arrival.liveArrivalTime) ? "As Scheduled"
                : `${arrival.liveArrivalTime.hour}:${arrival.liveArrivalTime.minute}`,
            livePosition: (!arrival.livePosition) ? "Position Unvailable"
                : `${arrival.livePosition.latitude}, ${arrival.livePosition.longitude}`
        }
    )).map(arrival => (
        // stringify property names for nice printing
        {
            "Route Short Name": arrival.routeShortName,
            "Route Long Name": arrival.routeLongName,
            "Service ID": arrival.serviceId,
            "Headsign": arrival.headsign,
            "Scheduled Arrival Time": arrival.scheduledArrivalTime,
            "Live Arrival Time": arrival.liveArrivalTime,
            "Live Position": arrival.livePosition
        }
    ));
}


/**
 * Prompts the user to determine whether they want to run the tracker again.
 * 
 * @param {number} [attempts = 0] number of previously failed attempts
 * @param {string} [previous = ""] previous invalid response string
 * 
 * @returns {Promise<boolean>} whether the user wants to run the tracker again
 */
async function getAgain(attempts: number = 0, previous: string = ""): Promise<boolean> {
    if (attempts) {
        console.log(`    "${previous}" is not a valid response.`)

        if (attempts === MAX_FAILED_ATTEMPTS) {
            console.log("    You failed to enter a valid response.");
            process.exit(1);
        } else {
            console.log("    Please enter 'y', 'yes', 'n' or 'no'.")
        }
    }

    let result = await prompt.get(getPromptSchema("again"));
    let again = result.property as string;

    if (/^(y|yes)$/.test(again.toLowerCase())) {
        return true;
    } else if (/^(n|no)$/.test(again.toLowerCase())) {
        return false;
    }

    return getAgain(++attempts, again);
}

let staticData = await getStaticData();
({ stops, stopTimes, trips, calendarDates, calendar, routes } = staticData);

let routeIds = routes.map(route => route.route_id);

let apiData = await retrieveApiData(routeIds);
([alerts, tripUpdates, vehiclePositions] = apiData);

setInterval(async () => {
    let apiData = await retrieveApiData(routeIds);
    ([alerts, tripUpdates, vehiclePositions] = apiData);
}, 300000);

main();
