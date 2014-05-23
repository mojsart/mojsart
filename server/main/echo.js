"use strict";

var echojs      = require('echojs'),
    api_keys    = require('./api_config.js');

console.log(api_keys.echo_api_key);
module.exports = exports = echojs({
  // NEED API KEY in api_config.js
  key: process.env.ECHO_API || api_keys.echo_api_key
});