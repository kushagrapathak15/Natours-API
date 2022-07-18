const express = require('express');
const authController = require('../controllers/authController');
const reviewRouter = require('../routes/reviewRouter');

const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
} = require('../controllers/tourController');

const router = express.Router();

// router.param('tourId', checkId);
router.use('/:tourId/reviews', reviewRouter);

router.route('/monthly-plan/:year').get(getMonthlyPlan);
router.route('/tour-stats').get(getTourStats);
router.route('/top-5-best-tours').get(aliasTopTours, getAllTours);
router.route('/').get(authController.protect, getAllTours).post(createTour);
router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(
    authController.protect,
    authController.restrictTo(['admin', 'lead-guide']),
    deleteTour
  );

module.exports = router;
