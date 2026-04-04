//custom error classeset u throw meaningful errors
export class AppError extends Error {
    constructor(message, statusCode){
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;  //our own known errors vs unexpected errors
    }
}

export class NotFoundError extends AppError {
    constructor(resource = 'Resource'){
        super(`${resource} not found`, 404);
    }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized. Please login.') {
    super(message, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden. You do not have permission.') {
    super(message, 403);
  }
}

export class ValidationError extends AppError {
  constructor(message) {
    super(message, 400);
  }
}

export class ConflictError extends AppError {
  constructor(message) {
    super(message, 409);
  }
}
