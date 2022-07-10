const express = require('express');
const {
  getAllUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
} = require('./../controllers/userController');
const routes = express.Router();

routes.route('/').get(getAllUsers).post(createUser);
routes.route('/:userId').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = routes;
