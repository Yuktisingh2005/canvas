// A known, expected error (bad input, not found, unauthorized) that we want to
// surface to the client with a specific status code and message, as opposed to
// an unexpected bug — those get logged and turned into a generic 500.
export class AppError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}