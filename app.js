const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRouter');
const userRouter = require('./routes/userRouter');
const reviewRouter = require('./routes/reviewRouter');

const app = express();
//Set Security HTTP Headers
app.use(helmet());

//Development Logging Middleware
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

//Body Parser,Reading data from body to req.body
app.use(express.json({ limit: '10kb' }));

//Data Sanitization Against NoSQL query injection
app.use(mongoSanitize());

//Data Sanitization Against XSS
app.use(xss());

//Preventing Parameter Pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'price',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
    ],
  })
);

//Serving static files
app.use(express.static(`${__dirname}/public`));

//Rate Limiting
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP. Please try again in an hour.',
});
app.use('/api', limiter);

//Routing
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('*', (req, res, next) =>
  next(new AppError(`Cant Find ${req.originalUrl} on the server`, 404))
);

//Error Handling
app.use(globalErrorHandler);
module.exports = app;
