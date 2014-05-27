"use strict";

var controller = require('./song_controllers.js');

module.exports = exports = function (router) {
  router.route('/')
    .get(controller.get)
    // post handles submits with new user inputs
    .post(controller.postUserData);

  // serving audio file route
  router.route('/md5/*')
    .get(controller.getSong);
  router.rout('/upload')
    .post(controller.postSong);
};
