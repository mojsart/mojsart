"use strict";

var Song = require('./song_model.js'),
    fs = require('fs'),
    helpers = require('./song_helpers.js'),
    nodepath = require('path');

module.exports = exports = {
  deleteSongs: function() {
    helpers.readDirEach(exports.findOldSongs);
  },

  findOldSongs: function(file, callback) {
    // only get files that are mp3s
    var bool = helpers.filenameRegEx(file);
    if (bool) {
      var path = nodepath.join(helpers.dirName, file);
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
