console = console;

'use strict';

var Song = require('./song_model.js'),
    echo = require('../main/echo.js'),
    fs = require('fs'),
    nodePath = require('path'),
    helpers = require('./song_helpers.js'),
    http = require('http'),
    Q = require('q');

module.exports = exports = {
  // starting point for upload songs, read all songs in library
  uploadSongs: function() {
    console.log('starting upload');
    helpers.readDirEach(exports.validateFileType);
  },

  // validate songtype using regex filter and check if filename is found in db
  validateFileType: function(file, callback) {
    console.log('validating filetype');
    if(helpers.filenameRegEx(file)) {
      console.log('processing file', file);
      helpers.checkSongNotInDB('filename', file, exports.echoUpload, exports.recacheExistingSong);
    }
  },

  recacheExistingSong: function(filename) {
    Q(Song.update({filename: filename}, {cached: true}).exec())
      .fail(helpers.callbackError);
  },

  // send song to echo nest
  // move this to echo.js
  echoUpload: function(filename, callback) {
    var location = nodePath.join(helpers.dirName , filename);
    var filetype = nodePath.extname(location).substr(1).toLowerCase();
    console.log('Sending the following file to The Echo Nest:', location);
    Q.nfcall(fs.readFile, location)
    .then(function(buffer) {
      // console.log(location, '\'s buffer:\n', buffer);
      // console.log(location, '\'s filetype:', filetype);
      Q.nfcall(echo.postBuffer, buffer)
        .then(function(echoNestResponse) {
          console.log('echoNestResponse: ', echoNestResponse);
          var p = JSON.parse(echoNestResponse);
          exports.handleEchoResponse(null, p, filename);
        });
    });
  },

  // handle echo nest response
  // 1. check if song filename in db
  // 2. save pending processing song in db
  // 3. check to make sure the song hasn't already been processed in the async
  // 4. start echo nest interval 
  handleEchoResponse: function(err, json, filename) {
    helpers.callbackError(err);
    helpers.checkSongNotInDB('filename', filename, function(filename) { 
      helpers.saveSong(json.response.track, filename);
      helpers.checkSongNotInDB('echoData.md5', json.response.track.md5, function(md5) {
        exports.setEchoInterval(md5, filename);
      });
    });
  },

  // ping echo nest for status update
  setEchoInterval: function(md5, filename) {
    var waittime = 5000;
    var interval = setInterval(function(md5){
      // arguments : query with the desired md5, boolean to state whether there is a boolean
      // filename to save, and the interval object which is needed to clearInterval
      helpers.echoFetchMD5(md5, false, filename, interval);                    
    }, waittime, md5);
  }
};
