"use strict";

var controller = require('./song_controllers.js');

module.exports = exports = function (router) {
  router.route('/')
    .get(controller.get)
    // post handles submits with new user inputs
    .post(controller.postUserData);

  router.route('/play')
    .post(controller.requestSong);
};