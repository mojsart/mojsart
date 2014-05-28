"use strict";

var controller = require('./song_controllers.js');

module.exports = exports = function (router) {
  router.route('/')
    .get(controller.get)
    // post handles submits with new user inputs
    .post(controller.postUserData);

  // serving audio file route
  router.route('/get/md5/*')
    .get(controller.getSong);
  router.route('/send')
    .post(controller.postSong);
};
