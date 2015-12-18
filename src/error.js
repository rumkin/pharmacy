'use strict';

module.exports = PharmacyError;

/**
 * PharmacyError is an error object to specify custom errors occured
 * in Pharmacy.
 *
 * @param {string} message Error message.
 * @extends Error.
 * @constructor
 */
function PharmacyError(message) {
    Error.call(this, message);
    Error.captureStackTrace(this);
    this.message = message;
}

Object.setPrototypeOf(PharmacyError.prototype, Error.prototype);
