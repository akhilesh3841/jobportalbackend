class ErrorHandler extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

export const middleware = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal server error";

    // Handle Mongoose castError
    if (err.name === "CastError") {
        const message = `Invalid ${err.path}`;
        err = new ErrorHandler(message, 400);
    }

    // Handle Mongoose duplicate key error
    if (err.code === 11000) {
        const message = `Duplicate ${Object.keys(err.keyValue)} entered.`;
        err = new ErrorHandler(message, 400);
    }

    // Handle invalid JWT error
    if (err.name === "JsonWebTokenError") {
        const message = `Json Web Token is invalid, Try again.`;
        err = new ErrorHandler(message, 400);
      }
      if (err.name === "TokenExpiredError") {
        const message = `Json Web Token is expired, Try again.`;
        err = new ErrorHandler(message, 400);
      }
    
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
      });
    };
export default ErrorHandler;
