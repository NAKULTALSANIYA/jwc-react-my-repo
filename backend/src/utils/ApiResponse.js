class ApiResponse {
  constructor(statusCode, message, data = null) {
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }

  static success(res, message = 'Success', data = null, statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  static error(res, message = 'Internal Server Error', statusCode = 500, data = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      data,
      timestamp: new Date().toISOString()
    });
  }

  static badRequest(res, message = 'Bad Request', data = null) {
    return this.error(res, message, 400, data);
  }

  static unauthorized(res, message = 'Unauthorized', data = null) {
    return this.error(res, message, 401, data);
  }

  static forbidden(res, message = 'Forbidden', data = null) {
    return this.error(res, message, 403, data);
  }

  static notFound(res, message = 'Not Found', data = null) {
    return this.error(res, message, 404, data);
  }

  static conflict(res, message = 'Conflict', data = null) {
    return this.error(res, message, 409, data);
  }

  static validationError(res, message = 'Validation Error', data = null) {
    return this.error(res, message, 422, data);
  }

  static tooManyRequests(res, message = 'Too Many Requests', data = null) {
    return this.error(res, message, 429, data);
  }

  static serverError(res, message = 'Internal Server Error', data = null) {
    return this.error(res, message, 500, data);
  }
}

export default ApiResponse;
