const AppError = require('../utils/appError');

const handleCastErrorDB = (err) => {
  const message = `Invalid Request ${err.path}:${err.val}`;
  return new AppError(message, 400);
};

const handleDuplicateErrorDB = (err) => {
  const key = Object.keys(err.keyValue).join('');
  const message = `The key '${key}' has duplicate value of '${err.keyValue[key]}'`;
  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid Input Data ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
  // res.status(err.statusCode).json({
  //   status: err.status,
  //   error: err,
  //   message: err.message,
  //   stack: err.stack,
  // });
  res.status(404).json({
    status: 'fail',
    error: err,
    message: err.message,
  });
};
const sendErrorProd = (err, res) => {
  //OPERATION ERROR: SEND MESSAGE TO THE CLIENT
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    //PROGRAMMING OR other unknown error: dont leak details
  } else {
    console.error('Error ', err);
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong',
    });
  }
};

const handleJsonWebTokenError = () =>
  new AppError('Invalid token.Please log in again.', 401);

const handleJWTExpiredError = () =>
  new AppError('Token expired.Please log in again.', 401);

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDuplicateErrorDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError')
      error = handleJsonWebTokenError(error);
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError(error);
    sendErrorProd(error, res);
  }
};
