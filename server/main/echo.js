"use strict";

var http        = require('http');

module.exports = exports = {
  // NEED API KEY in api_config.js
  key: process.env.ECHO_API || api_keys.echo_api_key,

  get: function(md5, cb) {
    var queryURL = [];
    var url = '/api/v4/track/profile';
    var query = {
      api_key: exports.key,
      format: 'json',
      md5: md5,
      bucket: 'audio_summary'
    };
    for (var key in query) {
      queryURL.push(key + '=' + query[key]);
    }
    queryURL = url + '?' + queryURL.join('&');

    var options = {
      hostname: 'developer.echonest.com',
      path: queryURL
    };
    http.request(options, function(response) {
      var str = '';
      response.on('data', function(chunk){
        if (chunk) {
          str+=chunk;
        }
      });
      response.on('end', function() {
        str = JSON.parse(str);
        console.log(str);
        cb(str);
      });      
    })
    .end();
  },

  postBuffer: function(buffer, callback) {
    // Build the post string from an object
    var post_data = buffer;

    // An object of options to indicate where to post to
    var post_options = {
        host: 'developer.echonest.com',
        port: '80',
        path: '/api/v4/track/upload?api_key=' + exports.key + '&filetype=mp3',
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
  }
 };
