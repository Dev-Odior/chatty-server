import HTTP_STATUS from 'http-status-codes';

export interface IErrorResponse {
  message: string;
  statusCode: number;
  status: string;
  serializeError(): IError;
}

interface IError {
  message: string;
  statusCode: number;
  status: string;
}

export abstract class CustomError extends Error {
  abstract statusCode: number;
  abstract status: string;
  constructor(message: string) {
    super(message);
  }

  public serializeError() {
    return {
      message: this.message,
      statusCode: this.statusCode,
      status: this.status
    };
  }
}

export class JoiValidationError extends CustomError {
  statusCode: number = HTTP_STATUS.BAD_REQUEST;
  status: string = 'Error';
  constructor(message: string) {
    super(message);
  }
}

export class BadRequestError extends CustomError {
  statusCode: number = HTTP_STATUS.BAD_REQUEST;
  status: string = 'Error';
  constructor(message: string) {
    super(message);
  }
}

export class NotFoundError extends CustomError {
  statusCode: number = HTTP_STATUS.NOT_FOUND;
  status: string = 'Error';
  constructor(message: string) {
    super(message);
  }
}

export class NotAuthorized extends CustomError {
  statusCode: number = HTTP_STATUS.UNAUTHORIZED;
  status: string = 'Error';
  constructor(message: string) {
    super(message);
  }
}

export class FilesTooLargeError extends CustomError {
  statusCode: number = HTTP_STATUS.REQUEST_TOO_LONG;
  status: string = 'Error';
  constructor(message: string) {
    super(message);
  }
}

export class ServerError extends CustomError {
  statusCode: number = HTTP_STATUS.SERVICE_UNAVAILABLE;
  status: string = 'Error';
  constructor(message: string) {
    super(message);
  }
}
