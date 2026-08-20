/**
 * Sends a consistently-shaped success response.
 * { success: true, message, data }
 */
const sendResponse = (res, statusCode, message, data = null) => {
  const body = { success: true, message };

  if (data !== null && data !== undefined) {
    body.data = data;
  }

  return res.status(statusCode).json(body);
};

module.exports = { sendResponse };
