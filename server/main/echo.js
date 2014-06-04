"use strict";

var echojs      = require('echojs'),
    api_keys    = require('./api_config.js'),
    http        = require('http');

module.exports = exports = {
  // NEED API KEY in api_config.js
  key: process.env.ECHO_API || api_keys.echo_api_key,

  get: function(md5, cb) {
    console.log('getting md5', md5);
    var queryURL = [];
    var url = '/api/v4/track/profile';
    var query = {
      api_key: exports.key,
      format: 'json',
      md5: md5,
      bucket: 'audio_summary'
    }

    for (var key in query) {
      queryURL.push(key + '=' + query[key]);
    }
    queryURL = url + '?' + queryURL.join('&');
    console.log(queryURL);

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

  // oldEcho: echojs({
  //   key: process.env.ECHO_API || api_keys.echo_api_key
  // })

  // post: ,

};


    // var options = {
    //   hostname: 'developer.echonest.com',
    //   path: '/api/v4/track/profile?api_key=OTEBZ6M2CJSZTKH6Q&format=json&md5=23f455935fafa3107ae7f4a9298f893b&bucket=audio_summary',
    // };
