const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const sendEmail = require('../utils/email');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;
  res.status(statusCode).json({ status: 'success', token, data: { user } });
};

exports.signUp = catchAsync(async (req, res) => {
  const { name, email, password, passwordConfirm, role } = req.body;
  const newUser = await User.create({
    name,
    email,
    password,
    passwordConfirm,
    role,
  });
  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError('Please provide email and password', 400));

  const user = await User.findOne({ email }).select('+password');
  const correct = await user.correctPassword(password, user.password);
  if (!user || !correct) {
    return next(new AppError('Invalid email or password', 401));
  }

  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  // console.log('Checking whether user is authenticated...');

  //1) Gettink Token and Checking if it is there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token)
    return next(
      new AppError('You are not logged in! Please log in to get access')
    );

  //2)Verifying Token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //3) Check if user still exists
  const currUser = await User.findById(decoded.id);

  if (!currUser)
    return next('The user belonging to this token no longer exists', 401);

  //4)Check if user changed password after token was issued
  if (currUser.changedPasswordAfter(decoded.iat))
    return next('User recently changed password! please log in again.', 401);

  req.user = currUser;
  // console.log('User Authenticated');
  next();
});

exports.restrictTo = (...roles) => {
  //console.log('Checking whether user is authorized...');
  return (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError('You do not have permission to access this route.', 403)
      );
    // console.log('User Authorized');
    next();
  };
};

exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1)Get the user basen on posted email
  const user = await User.findOne({ email: req.body.email });
  // console.log(user);
  if (!user) return next(new AppError('No user found with this email', 404));

  //2)Generate the random reset token
  const resetToken = user.createPasswordResetToken();
  // console.log(resetToken);
  await user.save({ validateBeforeSave: false });

  //3)Send the reset token to user's email address
  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot Your Password? Submit a PATCH request with your new password and passwordConfirm to:\n${resetUrl}.
  \nIf you didn't forget your password,please ignore this email`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token(valid for 10 min)',
      message,
    });
    res.status(200).json({
      status: 'success',
      messaage: 'Token sent to user email',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError(
        'There was an error sending the email.Please try again later',
        500
      )
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1)Get the user based on the token
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //2)If the token has not expired,and there is a user,set the new password
  if (!user) return next(new AppError('Token is invalid or has expired.', 500));

  //3)Update changePasswordAt propery
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  //4)Login the user,send JWT
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1) Get user from collection
  const user = await User.findById(req.user._id).select('+password');
  //2) Check if Posted current password is correct
  const correct = await user.correctPassword(
    req.body.passwordCurrent,
    user.password
  );
  if (!correct) return next('Password is incorrect.Please try again.', 401);

  //3) If so,update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  //4)Login the user,send jwt
  createSendToken(user, 200, res);
});
