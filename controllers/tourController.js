const fs = require('fs');

const tours = JSON.parse(
  fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
);

exports.checkId = (req, res, next, val) => {
  console.log(`Tour Id is ${val}`);
  if (req.params.tourId * 1 >= tours.length) {
    return res.status(404).json({
      status: 'failed',
      message: 'Invalid tour id',
    });
  }
  next();
};

exports.checkBody = (req, res, next) => {
  if (!req.body.name || !req.body.price) {
    return res
      .status(400)
      .json({ status: 'failed', message: 'Invalid tour name or price' });
  }
  next();
};

exports.getAllTours = (req, res) => {
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      tours: tours,
    },
  });
};

exports.getTour = (req, res) => {
  const tourId = req.params.tourId * 1;
  const tour = tours.find((el) => el.id === tourId);
  res.status(200).json({
    status: 'message',
    data: { tour },
  });
};

exports.deleteTour = (req, res) => {
  const tourId = req.params.tourId * 1;
  const updatedTours = tours.filter((el) => el.id != tourId);
  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
    JSON.stringify(updatedTours),
    (err) => {
      res.status(204).json({
        status: 'success',
        data: null,
      });
    }
  );
};
exports.createTour = (req, res) => {
  const newId = tours[tours.length - 1].id + 1;
  const newTour = Object.assign({ id: newId }, req.body);
  tours.push(newTour);
  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
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

exports.updateTour = (req, res) => {
  const tourId = req.params.tourId * 1;
  const tour = tours.find((el) => el.id == tourId);

  const updatedTour = Object.assign(tour, req.body);
  const updatedTours = tours.map((el) => (el.id === tourId ? updatedTour : el));
  fs.writeFile(
    `${__dirname}/../dev-data/data/tours-simple.json`,
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
