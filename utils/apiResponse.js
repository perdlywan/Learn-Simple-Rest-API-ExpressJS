// Helper to standardize successful API responses across controllers.
const buildResponse = (data, message = 'success', meta) => {
  const response = { message, data };
  if (meta !== undefined) {
    response.meta = meta;
  }
  return response;
};

module.exports = { buildResponse };
