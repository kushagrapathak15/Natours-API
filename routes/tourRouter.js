const express = require('express');
const authController = require('../controllers/authController');
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

router.route('/monthly-plan/:year').get(getMonthlyPlan);
router.route('/tour-stats').get(getTourStats);
router.route('/top-5-best-tours').get(aliasTopTours, getAllTours);
router.route('/').get(authController.protect, getAllTours).post(createTour);
router
  .route('/:tourId')
  .get(getTour)
  .patch(updateTour)
  .delete(
    authController.protect,
    authController.restrictTo(['admin', 'lead-guide']),
    deleteTour
  );

module.exports = router;
