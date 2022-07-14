//STARTING APPLICATION
const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('UncaughtError', (err) => {
  console.log('Uncaught Error!');
  console.log(err.name, err.message);
  process.exit(1);
});
dotenv.config({ path: './config.env' });

const app = require('./app');

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('Database connection established');
  });

const port = 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

process.on('UnhandledRejection', (err) => {
  console.log('Unhandled Rejection!');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
