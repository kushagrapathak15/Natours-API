const mongoose = require('mongoose');
const validator = require('validator');
const bcrpyt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please Enter Your Name'],
  },
  email: {
    type: String,
    required: [true, 'Please Provide Your Email Address'],
    validate: [validator.isEmail, 'Please Provide a valid email address'],
    unique: true,
    lowercase: true,
  },
  role: {
    type: String,
    enum: {
      values: ['user', 'admin', 'guide', 'lead-guide'],
      message: 'Role must be either user,admin,guide or lead-guide',
    },
    default: 'user',
  },
  photo: {
    type: String,
  },
  password: {
    type: String,
    minlength: 8,
    required: [true, 'Please Enter A Password'],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please Confirm Your Password'],
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: 'Passwords do not match',
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false,
  },
});

userSchema.pre('save', async function (next) {
  //ONLY RUN THIS FUNCTION IF PASSWORD WAS ACTUALLY MODIFIED
  if (!this.isModified('password')) return next();

  //HASH THE PASSWORD WITH THE COST OF 12
  this.password = await bcrpyt.hash(this.password, 12);
  //DELETE PASSWORD CONFIRM FIELD
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrpyt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = (JWTTimestamp) => {
  if (!this.passwordChangedAt) return false;
  const changedTimestamp = parseInt(
    this.passwordChangedAt.getTime() / 1000,
    10
  );
  return JWTTimestamp < changedTimestamp;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

userSchema.pre(/^find/, function (next) {
  //this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
