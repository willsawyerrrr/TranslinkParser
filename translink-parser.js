let prompt = require("prompt-sync")({ sigint: true });

const MAX_FAILED_ATTEMPTS = 4;

/**
 * Main program loop.
 * @param {boolean} [welcome = true] whether to output the welcome message
 */
function main(welcome = true) {
    if (welcome) {
        console.log("Welcome to the UQ Lakes station bus tracker!");
    }

    let date = getDate();
    let time = getTime();

    // filter data
    // output data

    if (getAgain()) {
        main(false);
    } else {
        console.log("Thanks for using the UQ Lakes Station bus tracker!");
    }
}


/**
 * Prompts the user for the departure date to search.
 * 
 * @param {number} [attempts = 0] number of previously failed attempts
 * @param {string} [previous = null] previous invalid date string
 * 
 * @returns {object} date object with year, month and day properties
 */
function getDate(attempts = 0, previous = null) {
    if (attempts) {
        console.log(`    "${previous}" is not a valid date.`)
    }

    if (attempts === MAX_FAILED_ATTEMPTS) {
        console.log("    You failed to enter a valid date.");
        process.exit(1);
    } else {
        console.log("    Please enter a date in YYYY-MM-DD format.")
    }

    let date = prompt("What date will you depart UQ Lakes station by bus? ");

    if (validateDate(date)) {
        return {
            year: parseInt(date.substring(0, 4)),
            month: parseInt(date.substring(5, 7)),
            day: parseInt(date.substring(8))
        };
    }

    return getDate(++attempts, date);
}


/**
 * Prompts the user for the departure time to search.
 * 
 * @param {number} [attempts = 0] number of previously failed attempts
 * @param {string} [previous = null] previous invalid time string
 * 
 * @returns {object} time object with hour and minute properties
 */
function getTime(attempts = 0, previous = null) {
    if (attempts) {
        console.log(`    "${previous}" is not a valid time.`)
    }

    if (attempts === MAX_FAILED_ATTEMPTS) {
        console.log("    You failed to enter a valid time.");
        process.exit(1);
    } else {
        console.log("    Please enter a time in HH:mm format.")
    }

    let time = prompt("What time will you depart UQ Lakes station by bus? ");

    if (validateTime(time)) {
        return {
            hour: parseInt(time.substring(0, 2)),
            minute: parseInt(time.substring(3))
        };
    }

    return getTime(++attempts, time);
}


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
            case 1, 3, 5, 7, 8, 10, 12:
                return day <= 31;
            case 4, 6, 9, 11:
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
        let year, month, day = integerComponents;
        return year > 2020
            && month >= 1 && month <= 12
            && validateDay(month, day);
    }

    return validateDateFormat(date) && validateDateComponents(date.split("-"));
}


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
        let hour, minute = integerComponents;
        return hour >= 0 && hour <= 23
            && minute >= 0 && minute <= 59;
    }

    return validateTimeFormat(time) && validateTimeComponents(time.split(":"));
}


/**
 * Prompts the user to determine whether they want to run the tracker again.
 * 
 * @param {number} [attempts = 0] number of previously failed attempts
 * @param {string} [previous = null] previous invalid response string
 * 
 * @returns {boolean} `true` if the user wants to run the tracker again; `false` otherwise
 */
function getAgain(attempts = 0, previous = null) {
    if (attempts) {
        console.log(`    "${again}" is not a valid response.`)
    }

    if (attempts === MAX_FAILED_ATTEMPTS) {
        console.log("    You failed to enter a valid response.");
        process.exit(1);
    } else {
        console.log("    Please enter 'y', 'yes', 'n' or 'no'.")
    }

    let again = prompt("Would you like to search again? ");

    if (/^(y|yes)$/.test(again.toLowerCase())) {
        return true;
    } else if (/^(n|no)$/.test(again.toLowerCase())) {
        return false;
    }

    return getAgain(++attempts, again);
}

main();
