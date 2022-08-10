const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
// const AppError = require('../utils/appError');

exports.getOverview = catchAsync(async (req, res) => {
  //1) Get Tour Data from Collection
  const tours = await Tour.find();
  //2 Build template(overview.pug)
  //3) Render  that template using the tours data from step 1
  res.status(200).render('overview', {
    title: 'All Tour',
    tours,
  });
});

exports.getTour = catchAsync(async (req, res) => {
  //1)Get the data,for the requested tour(including reviews and guides)
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    fields: 'review rating user',
  });
  //2)Build the template
  //3)Render that template using the data from step1
  res.status(200).render('tour', {
    title: `${tour.name} Tour`,
    tour,
  });
});

exports.getLoginForm = (req, res) => {
  res.status(200).render('login', {
    title: 'Login',
  });
};
