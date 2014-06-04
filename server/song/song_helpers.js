"use strict";

var Song = require('./song_model.js'),
    Q    = require('q'),
    echo = require('../main/echo.js'),
    fs = require('fs'),
    path = require('path'),
    async = require('async');

module.exports = exports = {
  dirName: __dirname + '/lib', 

  // starting point for upload songs, read all songs in library
  readDirEach: function(func) {
    Q.nfcall(fs.readdir, exports.dirName)
      .then(function(files) {
        async.each(files, func, exports.callbackError);
      })
      .fail(exports.callbackError);
  },

  // TODO: handle pending in db
  echoFetchMD5: function(md5, bool, filename, interval) {
    echo.get(md5, function(json) {
      // returns a response referenced here: http://developer.echonest.com/docs/v4/track.html#profile
      // calls SaveSongMD5 if processing is complete
      if (json.response.track.status === "complete") {
        exports.updateSong(json.response.track, filename);
        if (bool === false) {
          bool = true;
        }
      }
      if (bool) {
        clearInterval(interval);
      }
    });
  },

  saveSong: function(trackData, filename) {
    // create a song model
    // populate with echo nest data
    // initializes a new instance of song with the received trackData
    var song = new Song({
      echoData: {
        status: trackData.status
      },
      filename: filename,
    });       
    // saves to our mongoose database if it doesn't exist
    var $songSave = Q.nbind(song.save,song);
    $songSave()
      .then(function(saved) {
        console.log('song saved');
      })
      .fail(exports.callbackError);
  }, 

  updateSong: function(trackData, filename) {
    var update = {
      echoData: {
        artist: trackData.artist,
        title: trackData.title,
        md5: trackData.md5,
        status: trackData.status,
        audio_summary: {
          danceability: trackData.audio_summary.danceability,
          duration: trackData.audio_summary.duration,
          energy: trackData.audio_summary.energy,
          key: trackData.audio_summary.key,
          loudness: trackData.audio_summary.loudness,
          speechiness: trackData.audio_summary.speechiness,
          acousticness: trackData.audio_summary.acousticness,
          liveness: trackData.audio_summary.liveness,
          tempo: trackData.audio_summary.tempo
        }
      }, 
      userData: {
        speechiness: null,
        acousticness: null        
      },
      filename: filename,
      cached: true
    };

    Q(Song.update({'filename' : filename}, update).exec())
      .then(function(saved) {
        console.log('song updated');
      });
  },

  checkSongNotInDB: function(searchField, input, cb, cb2) {
    // for MD5: searchField = 'echoData.md5'
    // for filename: searchField = 'filename'
    var query = {};
    query[searchField] = input
    Q(Song.findOne(query).exec())
      .then(function(song) {
        if (!song) {
          cb(input);
        } else { 
          if (cb2) {
            cb2(input);
          }
        }
      })
      .fail(function(reason) {
        console.log(reason);
      });
  },

  callbackError: function(err) {
    if (err) console.log(err);
  },

  filenameRegEx: function(filename) {
    // var match = /^(.*\.(?!(mp3|mp4|wav|au|ogg|m4a|mp4)$))?[^.]*$/i;
    var match = /^(.*\.(?!(mp3)$))?[^.]*$/i;
    return(!match.test(filename));
  },

  // verifies filesize for uploads
  filesizeCheck: function(bytes) {
    var limit = 10;
    return (bytes/1000000 <= limit);
  }, 

  postSongSave: function(fromPath, toPath, cb) {
    Q.nfcall(fs.readFile, fromPath)
      .then(function(buffer) {
        return Q.nfcall(fs.writeFile, toPath, buffer);
      })
      .then(function() {
        return Q.nfcall(fs.unlink, fromPath);
      })
      .then(function(){
        cb(toPath);
      })
      .fail(exports.callbackError);    
  }  
};
