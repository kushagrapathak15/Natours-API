const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Please provide a valid review'],
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a valid rating'],
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Reviews must belong to a user.'],
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true }, id: false }
);

reviewSchema.pre(/^find/, function (next) {
  //POPULATING BOTH TOURS AND USERS
  // this.populate({ path: 'tour', select: 'name' }).populate({
  //   path: 'user',
  //   select: 'name photo',
  // });

  //POPULATING ONLY USERS
  this.populate({ path: 'users', select: 'name photo' });
  next();
});
const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
