const express = require('express');
const {
  getAllTours,
  createTour,
  getTour,
  updateTour,
  deleteTour,
  checkId,
  checkBody,
} = require('./../controllers/tourController');
const router = express.Router();

router.param('tourId', checkId);

router.route('/').get(getAllTours).post(checkBody, createTour);
router.route('/:tourId').get(getTour).patch(updateTour).delete(deleteTour);

module.exports = router;
