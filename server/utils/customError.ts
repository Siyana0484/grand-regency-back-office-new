class CustomError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message); //call the parent constructor with the message
    this.name = this.constructor.name; //set the name to the class name
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  statusCode: number,
  message: string
): CustomError => {
  return new CustomError(statusCode, message);
};
