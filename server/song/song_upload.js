console = console;

'use strict';

var Song = require('./song_model.js'),
    echo = require('../main/echo.js'),
    fs = require('fs'),
    path = require('path'),
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
      helpers.checkSongNotInDB('filename', file, exports.echoUpload);
    }
  },

  // send song to echo nest
  echoUpload: function(filename, callback) {
    var location = path.join(helpers.dirName , filename);
    var filetype = path.extname(location).substr(1).toLowerCase();

    console.log('sending the following file to The Echo Nest:', location);

    Q.nfcall(fs.readFile, location)
    .then(function(buffer) {
      console.log(location, '\'s buffer:\n', buffer);
      console.log(location, '\'s filetype:', filetype);
      Q.nfcall(exports.postBuffer, buffer)
      .then(function(echoNestResponse) {
        console.log('echoNestResponse: ', echoNestResponse);
        var p = JSON.parse(echoNestResponse);
        // callback(echoNestResponse, filename); // TODO don't hardcode the callback
        // return Q.nfcall(exports.handleEchoResponse, null, echoNestResponse, filename); // trying promise code
        exports.handleEchoResponse(null, p, filename);
      });
    });
      // helpers.callbackError(err);
  },
      // echo('track/upload').post({
      //   filetype: filetype             
      // }, 'application/octet-stream', buffer, function(err, json) {
      //   if (err) console.log(err);
      //   console.log('echo response', json);
      //   console.log(err);
      //   console.log(json);
      //   exports.handleEchoResponse(err, json, filename);
      // });

postBuffer: function(buffer, callback) {
  // Build the post string from an object
  var post_data = buffer;

  // An object of options to indicate where to post to
  var post_options = {
      host: 'developer.echonest.com',
      port: '80',
      path: '/api/v4/track/upload?api_key=' + 'OTEBZ6M2CJSZTKH6Q' + '&filetype=mp3',
      method: 'POST',
      headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Length': post_data.length
      }
  };

  // Set up the request
  var post_req = http.request(post_options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          console.log('Response:' + chunk);
          callback(null, chunk);
      });
  });

  // post the data
  post_req.write(post_data);
  post_req.end();

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