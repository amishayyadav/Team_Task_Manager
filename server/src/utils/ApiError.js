export class ApiError extends Error {
  constructor(statusCode, message, options = {}) {
    super(message);
    this.statusCode = statusCode;
    this.fieldErrors = options.fieldErrors;
    this.code = options.code;
    this.expose = true;
    Error.captureStackTrace?.(this, this.constructor);
  }

  static badRequest(message, fieldErrors) {
    return new ApiError(400, message, { fieldErrors });
  }
  static unauthorized(message = "Unauthorized") {
    return new ApiError(401, message);
  }
  static forbidden(message = "Forbidden") {
    return new ApiError(403, message);
  }
  static notFound(message = "Not found") {
    return new ApiError(404, message);
  }
  static conflict(message = "Conflict") {
    return new ApiError(409, message);
  }
}
