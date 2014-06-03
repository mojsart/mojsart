  "use strict";

var Song = require('./song_model.js'),
    echo = require('../main/echo.js'),
    fs = require('fs'),
    path = require('path'),
    helpers = require('./song_helpers.js'),
    http = require('http');

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
      console.log('processing file ', file);
      helpers.checkSongNotInDB('filename', file, function(filename) {
        var options = {
          hostname: 'developer.echonest.com',
          path: '/api/v4/track/profile?api_key=OTEBZ6M2CJSZTKH6Q&format=json&md5=23f455935fafa3107ae7f4a9298f893b&bucket=audio_summary',
        };

        var callback = function(response) {
          var str = '';
          response.on('data', function(chunk){
            str+=chunk;
          });

          response.on('end', function() {
            str = JSON.parse(str);
            console.log(str.response);
          });
        };

        http.request(options, callback).end();
      });
    }
  },

  // send song to echo nest
  echoUpload: function(filename) {
    var location = path.join(helpers.dirName , filename);
    var filetype = path.extname(location).substr(1).toLowerCase();
    console.log('sending to echo', location);
    fs.readFile(location, function(err, buffer) {
      helpers.callbackError(err);
      console.log(buffer);
      console.log(filetype);
      echo('track/upload').post({
        filetype: filetype             
      }, 'application/octet-stream', buffer, function(err, json) {
        if (err) console.log(err);
        console.log('echo response', json);
        console.log(err);
        console.log(json);
        exports.handleEchoResponse(err, json, filename);
      });
    });   
  },

  // handle echo nest response
  // 1. check if song filename in db
  // 2. save pending processing song in db
  // 3. check to make sure the song hasn't already been processed in the async
  // 4. start echo nest interval 
  handleEchoResponse: function(err, json, filename) {
    console.log('echo response handling', json);
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
      var query = {bucket: 'audio_summary', md5: md5};
      // arguments : query with the desired md5, boolean to state whether there is a boolean
      // filename to save, and the interval object which is needed to clearInterval
      helpers.echoFetchMD5(query, false, filename, interval);                    
    }, waittime, md5);
  },
};