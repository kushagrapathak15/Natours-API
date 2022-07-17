const User = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

const fitlerObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) newObj[key] = obj[key];
  });
  return newObj;
};
exports.getAllUsers = catchAsync(async (req, res) => {
  const users = await User.find();
  res.status(200).json({ status: 'success', results: users.length, users });
});
exports.getUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This Route is not yet defined.' });
};
exports.createUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This Route is not yet defined.' });
};
exports.updateUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This Route is not yet defined.' });
};
exports.deleteUser = (req, res) => {
  res
    .status(500)
    .json({ status: 'error', message: 'This Route is not yet defined.' });
};

exports.updateMe = catchAsync(async (req, res, next) => {
  //1) Create error if user posts password data
  if (req.body.password || req.body.passwordConfirm)
    return next(
      new AppError(
        'This Route is not for password updates. Please use /updateMyPassword',
        400
      )
    );
  //2)Filtered out unwanted field names that are not allowed to be updated
  const filteredBody = fitlerObj(req.body, 'name', 'email');
  //3) Update User Decument
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ stats: 'success', data: { user: updatedUser } });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
