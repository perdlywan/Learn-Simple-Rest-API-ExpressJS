const {APIError} = require('../utils/apiError');

const errorHandler = (err, req, res, next) => {
    console.error('ERROR:', err); 
    if(err instanceof APIError){
        console.log(err);
        return res.status(err.statusCode).json(err);
    }

    let newError = new APIError({});

    console.log(newError);
    return res.status(newError.statusCode).json(newError);
}

module.exports = {errorHandler};
