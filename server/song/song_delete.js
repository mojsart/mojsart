"use strict";

var Song = require('./song_model.js'),
    fs = require('fs'),
    helpers = require('./song_helpers.js'),
    nodepath = require('path'),
    Q = require('q');

module.exports = exports = {
  // starting point for delete song function
  deleteSongs: function() {
    helpers.readDirEach(exports.findOldSongs);
  },

  // locates old songs and passes to uncache song
  findOldSongs: function(file, callback) {
    // only get files that are mp3s
    var bool = helpers.filenameRegEx(file);
    if (bool) {
      var path = nodepath.join(helpers.dirName, file);
      Q.nfcall(fs.stat, path)
        .then(function(stats) {
          // find songs older than 15 min
          var now = new Date; 
          var elapsed = (now-stats.ctime)/60000;
          var timelimit = 15;
          if(elapsed > timelimit) {
            exports.uncacheSong(file, path);          
          }
        })
        .fail(helpers.callbackError);
    }
  },

  // deletes the song and marks the server as being not cached
  uncacheSong: function(file, path) {
    // delete songss
    Q(Song.update({filename: file, cached: true}, {cached: false}).exec())
      .then(function() {
        return Q.nfcall(fs.unlink, path);
      })
      .then(function(){
        console.log('file deleted');
      })
      .fail(helpers.callbackError); 
  }
};
