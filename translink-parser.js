let prompt = require("prompt-sync")();

console.log("Welcome to the UQ Lakes station bus tracker!");

let date, time, again;
do {
    date = getDate();
    time = getTime();


    // parse data
    // output data


    again = getAgain();
} while (again);

console.log("Thanks for using the UQ Lakes bus tracker!")


/**
 * Validates whether the given date is in ISO 8601 format: YYYY-MM-DD.
 * @param {string} date date string to validate
 * @returns {boolean} true if the date is valid, false otherwise
 */
function validateDate(date) {
    // "^" means "start of string"
    // "\d" means "digit"
    // "{n}" means "n occurrences"
    // "$" means "end of string"
    let dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    return dateRegex.test(date);
}


/**
 * Prompts the user for the departure date to search.
 * @returns {object} date object with year, month and day properties
 */
function getDate() {
    let date;
    do {
        date = prompt("What date will you depart UQ Lakes station by bus? ");
    } while (!validateDate(date));

    let result = {
        year: parseInt(date.substring(0, 4)),
        month: parseInt(date.substring(5, 7)),
        day: parseInt(date.substring(8))
    }

    return result
}


/**
 * Validates whether the given date is in ISO 8601 format: HH:mm.
 * @param {string} time date string to validate
 * @returns {boolean} true if the date is valid, false otherwise
 */
function validateTime(time) {
    // "^" means "start of string"
    // "\d" means "digit"
    // "{n}" means "n occurrences"
    // "$" means "end of string"
    let timeRegex = /^\d{2}:\d{2}$/;
    return timeRegex.test(time);
}


/**
 * Prompts the user for the departure time to search.
 * @returns {object} time object with hour and minute properties
 */
function getTime() {
    let time;
    do {
        time = prompt("What time will you depart UQ Lakes station by bus? ");
    } while (!validateTime(time));

    let result = {
        hour: parseInt(time.substring(0, 2)),
        minute: parseInt(time.substring(3))
    }

    return result
}


/**
 * Validates whether the given response is a valid yes or no response.
 * @param {string} response response string to validate
 * @returns {boolean} true if the response is valid; false otherwise
 */
function validateAgain(response) {
    // expected values: 'y', 'yes', 'n', 'no'; case-insensitive
    let responseRegex = /^(y|yes|n|no)$/;
    return responseRegex.test(response.toLowerCase());
}


/**
 * Prompts the user to determine whether they want to run the tracker again.
 * @returns {boolean} true if the user wants to run the tracker again; false otherwise
 */
function getAgain() {
    let again;
    do {
        again = prompt("Would you like to search again? ").toLowerCase();
    } while (!validateAgain(again));

    let yesRegex = /^(y|yes)$/;
    return yesRegex.test(again.toLowerCase());
}
