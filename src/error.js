module.exports = PharmacyError;

function PharmacyError(message) {
    Error.call(this, message);
    Error.captureStackTrace(this);
    this.message = message;
}

Object.setPrototypeOf(PharmacyError.prototype, Error.prototype);
