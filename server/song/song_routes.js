"use strict";

var controller = require('./song_controllers.js');
var multiparty = require('connect-multiparty');
var multipartMiddleware = multiparty();
var bodyParser  = require('body-parser');

module.exports = exports = function (router) {
  router.route('/')
    .get(controller.get)
    .post(controller.postUserData);
    // post handles submits with new user inputs
  
  // serving audio file route
  router.route('/get/md5/*')
    .get(controller.getSong);

  // only use multipart on /send route  
  router.post('/send', multipartMiddleware, controller.postSong);
};
