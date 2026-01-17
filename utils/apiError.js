class APIError extends Error {
    constructor({
        message = "Internal Server Error",
        statusCode = 500,
        errors,
    }) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        Error.captureStackTrace(this, this.constructor);
    }

    toJSON() {
            return {
                message: this.message,
                error: this.errors,
            };
    }
}

class APIErrorNotFound extends APIError {
    constructor(resource){
        super({
            message: `${resource} not found`,
            statusCode: 404,
        });
    }
}

module.exports = {APIError, APIErrorNotFound}