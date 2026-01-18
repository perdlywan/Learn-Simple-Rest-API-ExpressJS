// Catch-all middleware to ensure unknown routes produce a uniform 404 error.
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

module.exports = { notFoundHandler };
