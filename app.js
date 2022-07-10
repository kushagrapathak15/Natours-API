const express = require('express');
const fs = require('fs');
const { get } = require('http');

const app = express();
app.use(express.json());

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`)
);

const getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours: tours,
    },
  });
};

const getTour = (req, res) => {
  const tourId = req.params.tourId * 1;
  const tour = tours.find((el) => el.id === tourId);
  if (!tour) {
    return res.status(404).json({
      status: 'failed',
      message: 'Invalid Tour Id',
    });
  }
  res.status(200).json({
    status: 'message',
    data: { tour },
  });
};

const deleteTour = (req, res) => {
  const tourId = req.params.tourId * 1;
  if (tourId >= tours.length) {
    return res.status(404).json({
      status: 'failed',
      message: 'Invalid tour id',
    });
  }
  const updatedTours = tours.filter((el) => el.id != tourId);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(updatedTours),
    (err) => {
      res.status(204).json({
        status: 'success',
        data: null,
      });
    }
  );
};
const createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(tours),
    (err) => {
      res.status(201).json({
        status: 'success',
        data: {
          tour: newTour,
        },
      });
    }
  );
};

const updateTour = (req, res) => {
  const tourId = req.params.tourId * 1;
  const tour = tours.find((el) => el.id == tourId);

  if (!tour) {
    return res.status(404).json({
      status: 'failed',
      message: 'Invalid Tour Id',
    });
  }

  const updatedTour = Object.assign(tour, req.body);
  const updatedTours = tours.map((el) => (el.id === tourId ? updatedTour : el));
  fs.writeFile(
    `${__dirname}/dev-data/data/tours-simple.json`,
    JSON.stringify(updatedTours),
    (err) => {
      res.status(200).json({
        status: 'success',
        data: {
          updatedTour,
        },
      });
    }
  );
};

app.route('/api/v1/tours').get(getAllTours).post(createTour);
app
  .route('/api/v1/tours/:tourId')
  .get(getTour)
  .patch(updateTour)
  .delete(deleteTour);

app.listen(3000, () => {
  console.log('Server running at port 3000...');
});
