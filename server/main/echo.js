"use strict";

var http        = require('http'),
    qs          = require('qs');

var api_key = process.env.ECHO_API || 'MILUX5DWHLED7C7HF';

// builds request parameters for echo nest based on api requirements
var optionBuilder = function(type, data) {
  // declare general option/query parameters
  var query = { api_key: api_key };
  var options = {
    port: '80',
    hostname: 'developer.echonest.com',
    method: type,
    path: '/api/v4/track/'
  };
  // assign specific parameters based on request type
  if (type === 'GET') {
    options.path  = options.path + 'profile';
    query.format = 'json';
    query.md5 = data;
    query.bucket = 'audio_summary';
  } else if (type === 'POST') {
    options.path = options.path + 'upload';
    query.filetype = 'mp3';
    options.headers = {
      'Content-Type': 'application/octet-stream',
      'Content-Length': data.length
    };
  }
  // merge query results into a string
  options.path = options.path + '?' + qs.stringify(query);
  return options;
};

// gets song information from echo nest when passed a md5
var get = function(md5, cb) {
  // build echo nest requesst
  var options = optionBuilder('GET', md5);
  // make the http request
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
};

// sends song to echo nest when passed a file buffer
var postBuffer = function(buffer, callback) {
  // build echo nest request
  var options = optionBuilder('POST', buffer);
  // Set up the request
  var post_req = http.request(options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function (chunk) {
          console.log('Response:' + chunk);
          callback(null, chunk);
      });
  });
  // post the data
  post_req.write(buffer);
  post_req.end();
};

module.exports = exports = {
  key           : api_key,
  optionBuilder : optionBuilder,
  get           : get,
  postBuffer    : postBuffer
};
