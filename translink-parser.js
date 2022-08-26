import { main as retrieveApiData } from "./api.js";
import { getStaticData } from "./static.js";

import prompt from "prompt";
prompt.message = "";
prompt.delimiter = "";
prompt.colors = false;

const MAX_FAILED_ATTEMPTS = 4;

let alerts, calendarDates, calendar, routes, stops,
    stopTimes, trips, tripUpdates, vehiclePositions;

/**
 * Main program loop.
 * 
 * @param {boolean} [welcome = true] whether to output the welcome message
 */
async function main(welcome = true) {
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

function getPromptSchema(purpose) {
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
 * @param {string} [previous = null] previous invalid date string
 * 
 * @returns {object} date object with year, month and day properties
 */
async function getDate(attempts = 0, previous = null) {
    /**
     * Determines whether the given string represents a valid date.
     * 
     * @param {string} date date string to validate
     * 
     * @returns {boolean} `true` if the date string is valid; `false` otherwise
     */
    function validateDate(date) {
        /**
         * Determines whether the given string is of the correct format.
         */
        let validateDateFormat = (date) => /^\d{4}-\d{2}-\d{2}$/.test(date);

        /**
         * Validates whether the given day is valid for the given month.
         * 
         * @param {number} month month number
         * @param {number} day day number
         * 
         * @returns `true` if the day is valid for the given month; `false` otherwise
         */
        function validateDay(month, day) {
            if (day < 1) {
                return false;
            }

            switch (month) {
                case 1:
                case 3:
                case 5:
                case 7:
                case 8:
                case 10:
                case 12:
                    return day <= 31;
                case 4:
                case 6:
                case 9:
                case 11:
                    return day <= 30;
                case 2:
                    return day <= 28;
                default:
                    return false;
            }
        }

        /**
         * Determines whether each component of the given date string is valid.
         * 
         * @param {string[]} components components of the date string
         * 
         * @returns {boolean} `true` if the components are valid; `false` otherwise
         */
        function validateDateComponents(components) {
            let integerComponents = components.map(component => parseInt(component));
            let [year, month, day] = integerComponents;
            return year > 2020
                && month >= 1 && month <= 12
                && validateDay(month, day);
        }

        return validateDateFormat(date) && validateDateComponents(date.split("-"));
    }

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
    let date = promptResult.property;

    if (validateDate(date)) {
        return {
            year: parseInt(date.substring(0, 4)),
            month: parseInt(date.substring(5, 7)),
            day: parseInt(date.substring(8))
        };
    }

    return await getDate(++attempts, date);
}


/**
 * Prompts the user for the departure time to search.
 * 
 * @param {number} [attempts = 0] number of previously failed attempts
 * @param {string} [previous = null] previous invalid time string
 * 
 * @returns {object} time object with hour and minute properties
 */
async function getTime(attempts = 0, previous = null) {
    /**
     * Determines whether the given string represents a valid time.
     * 
     * @param {string} time time string to validate
     * 
     * @returns {boolean} `true` if the time string is valid; `false` otherwise
     */
    function validateTime(time) {
        /**
         * Determines whether the given string is of the correct format.
         */
        let validateTimeFormat = (time) => /^\d{2}:\d{2}$/.test(time);

        /**
         * Determines whether each component of the given time string is valid.
         * 
         * @param {string[]} components components of the time string
         * 
         * @returns {boolean} `true` if the components are valid; `false` otherwise
         */
        function validateTimeComponents(components) {
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
    let time = result.property;

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
 * The format of the objects in the returned array is:
 *  {
 *      routeShortName: string,
 *      routeLongName: string,
 *      serviceId: string,
 *      headsign: string,
 *      scheduledArrival: {
 *          hour: number,
 *          minute: number
 *      },
 *      liveArrival: {
 *          hour: number,       // currently null
 *          minute: number      // currently null
 *      },
 *      livePosition: {
 *          latitude: number,   // currently null
 *          longitude: number   // currently null
 *      }
 *  }
 * 
 * @param {object} date date object with year, month and day properties
 * @param {object} time time object with hour and minute properties
 * 
 * @returns {object[]} required data for buses arriving within 10 minutes of the
 * given time
 */
function filterStaticData(date, time) {
    /**
     * Parses the given date string into an object with hour and minute
     * properties.
     * 
     * @param {string} time time string in HH-mm format
     * 
     * @returns {object} time object with hour and minute properties
     */
    function parseTime(time) {
        return {
            hour: parseInt(time.substring(0, 2)),
            minute: parseInt(time.substring(3, 5))
        };
    }

    /**
     * Returns the number of minutes that elapse from `userTime` to `stopTime`.
     * 
     * @param {object} userTime time to search from
     * @param {object} stopTime arrival time of the bus
     * 
     * @returns {number} number of minutes that elapse from `userTime` to `stopTime`
     */
    function timeDiff(userTime, stopTime) {
        return (stopTime.hour - userTime.hour) * 60 + (stopTime.minute - userTime.minute);
    }

    let filteredStopTimes = stopTimes.filter(stopTime => {
        let arrivalTime = parseTime(stopTime.arrival_time);
        let diff = timeDiff(time, arrivalTime);
        return diff >= 0 && diff <= 10;
    });

    let filteredTripIds = filteredStopTimes.map(stopTime => stopTime.trip_id);
    let filteredTrips = trips.filter(trip => filteredTripIds.includes(trip.trip_id));
    let filteredRouteIds = filteredTrips.map(trip => trip.route_id);
    let filteredRoutes = routes.filter(route => filteredRouteIds.includes(route.route_id));

    let result = [];

    for (let stop of filteredStopTimes) {
        let trip = filteredTrips.find(trip => trip.trip_id === stop.trip_id);
        let route = filteredRoutes.find(route => route.route_id === trip.route_id);

        result.push(
            {
                "Route Short Name": route.route_short_name,
                "Route Long Name": route.route_long_name,
                "Service ID": trip.service_id,
                "Headsign": trip.trip_headsign,
                "Scheduled Arrival Time": parseTime(stop.arrival_time),
                // TODO: get from live data
                "Live Arrival Time": {
                    hour: null,
                    minute: null
                },
                "Live Position": {
                    latitude: null,
                    longitude: null
                }
            }
        );
    }

    result.sort((a, b) => a["Scheduled Arrival Time"].minute - b["Scheduled Arrival Time"].minute);
    result.sort((a, b) => a["Scheduled Arrival Time"].hour - b["Scheduled Arrival Time"].hour);
    // stringify the arrival times
    return result.map(arrival => (
        {
            ...arrival,
            "Scheduled Arrival Time": `${arrival["Scheduled Arrival Time"].hour.toString().padStart(2, '0')}:${arrival["Scheduled Arrival Time"].minute.toString().padStart(2, '0')}`,
            // TODO: uncomment when live data is available
            // Live Arrival Time: `${arrival["Live Arrival Time"].hour.toString().padStart(2, '0')}:${arrival["Live Arrival Time"].minute.toString().padStart(2, '0')}`
            // Live Position: `${arrival["Live Arrival Position"].latitude}:${arrival["Live Arrival Position"].longitude}`
        }
    ));
}


/**
 * Incorporates live data into the given static data.
 * 
 * @param {object[]} filteredStaticData information on relevant buses
 */
function incorporateApiData(filteredStaticData) {
    return filteredStaticData;
}


/**
 * Prompts the user to determine whether they want to run the tracker again.
 * 
 * @param {number} [attempts = 0] number of previously failed attempts
 * @param {string} [previous = null] previous invalid response string
 * 
 * @returns {boolean} `true` if the user wants to run the tracker again; `false` otherwise
 */
async function getAgain(attempts = 0, previous = null) {
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
    let again = result.property;

    if (/^(y|yes)$/.test(again.toLowerCase())) {
        return true;
    } else if (/^(n|no)$/.test(again.toLowerCase())) {
        return false;
    }

    return getAgain(++attempts, again);
}

let staticData = await getStaticData();
({ stops, stopTimes, trips, calendarDates, calendar, routes } = staticData);

let apiData = await retrieveApiData();
([alerts, tripUpdates, vehiclePositions] = apiData);

setInterval(async () => {
    let apiData = await retrieveApiData();
    ([alerts, tripUpdates, vehiclePositions] = apiData);
}, 300000);

main();
