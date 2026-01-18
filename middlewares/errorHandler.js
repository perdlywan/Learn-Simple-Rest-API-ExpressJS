// Global error formatter that logs (outside tests) and standardizes API responses.
const { env } = require('../config/env');
const {APIError} = require("../utils/apiError");

const errorHandler = (err, req, res, _next) => {
  if (err instanceof APIError) {
    res.status(err.statusCode).json(err)
  }

  console.error(err); // keep logging simple for now


  let newError = new APIError({})



  res.status(newError.statusCode).json(newError);
};

module.exports = { errorHandler };
