class ApiError extends Error {
  // `code` is an optional, stable machine-readable identifier (e.g. 'LAB_REQUEST_ALREADY_EXISTS')
  // that lets the frontend branch on the failure reason instead of parsing the human message.
  constructor(statusCode, message, errors = [], stack = '', code = null) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    this.code = code;
    this.success = false;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default ApiError;
