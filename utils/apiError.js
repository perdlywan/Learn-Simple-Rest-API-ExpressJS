class APIError extends Error {
    constructor({
        message = "INTERNAL SERVER ERROR",
        statusCode = 500,
        errors,
    }) {
        super(message);
        this.statusCode = statusCode
        this.errors = errors
        Error.captureStackTrace?.(this, this.constructor);
    }

    toJSON() {
        return {
            message: this.message,
            errors: this.errors
        }
    }
}

class APIErrorNotFound extends APIError {
    constructor(resource) {
        super({
            message: resource + " NOT FOUND",
            statusCode: 404,
        });
    }
}

class APIErrorValidation extends APIError {
    constructor(errs = []) {
        super({
            message: "Validation Error(s)",
            statusCode: 422,
            errors: errs
        });
    }
}

class APIErrorUnauthorized extends APIError {
    constructor(message = "UNAUTHORIZED") {
        super({
            message: message,
            statusCode: "401",
        });
    }
}

class APIErrorForbidden extends APIError {
    constructor(message = "User does not have permission to access this resource") {
        super({
            message: message,
            statusCode: "403",
        });
    }
}

module.exports = {APIError, APIErrorNotFound, APIErrorValidation, APIErrorUnauthorized, APIErrorForbidden}
