"use strict";

var Song = require('./song_model.js'),
    Q    = require('q'),
    echo = require('../main/echo.js'),
    fs = require('fs'),
    path = require('path'),
    async = require('async'),
    helpers = require('./song_helpers.js');

module.exports = exports = {
  deleteSongs: function() {
    helpers.readDirEach(exports.findOldSongs);
  },

  findOldSongs: function(file, callback) {
    // only get files that are mp3s
    var bool = helpers.filenameRegEx(file);
    if (bool) {
      var path = helpers.dirName + '/' + file;
      fs.stat(path, function(err, stats) {
        helpers.callbackError(err);
        var now = new Date; 
        var elapsed = (now-stats.ctime)/60000;
        var timelimit = 15;
        if(elapsed > timelimit) {
          exports.uncacheSong(file, path);
        }
      });
    }
  },

  uncacheSong: function(file, path) {
    Song.update({filename: file, cached: true}, {cached: false}, function(err, stuff) {
      helpers.callbackError(err);
      fs.unlink(path, function(err) {
        helpers.callbackError(err);
        console.log('file deleted');
      });
    });    
  }
};
