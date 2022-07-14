const express = require('express');
const morgan = require('morgan');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');

const app = express();
//MIDDLEWARE
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
app.use(express.json());
//Routing
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('*', (req, res, next) =>
  next(new AppError(`Cant Find ${req.originalUrl} on the server`, 404))
);
app.use(globalErrorHandler);
module.exports = app;
