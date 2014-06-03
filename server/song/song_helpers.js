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
    fs.readdir(exports.dirName, function(err, files) {
      async.each(files, func, exports.callbackError);
    });
  },

  // TODO: handle pending in db
  echoFetchMD5: function(query, bool, filename, interval) {
    // query should be something like {
    //   md5: 'cfa55a902533b32e87473c2218b39da9',
    //   bucket: 'audio_summary'
    // }
    // queries echoapi for the md5 we are looking for
    echo('track/profile').get(query, function (err, json) {
      exports.callbackError(err);
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
    var $promise = Q.nbind(song.save, song);
    $promise()
      .then(function(saved) {
        console.log('song saved');
      });
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

  checkSongNotInDB: function(searchField, input, cb) {
    // for MD5: searchField = 'echoData.md5'
    // for filename: searchField = 'filename'
    console.log('checking song')
    var query = {};
    query[searchField] = input
    Q(Song.findOne(query).exec())
      .then(function(song) {
        console.log('check db', song)
        if (!song) {
          cb(input);
        }
      })
      .fail(function(reason) {
        console.log(reason);
      });
  },

  callbackError: function(err) {
    if (err) console.log(err);
  },

  // track file size
  // delete 15 minutes songs
  // change db

  filenameRegEx: function(filename) {
    // var match = /^(.*\.(?!(mp3|mp4|wav|au|ogg|m4a|mp4)$))?[^.]*$/i;
    var match = /^(.*\.(?!(mp3)$))?[^.]*$/i;
    return(!match.test(filename));
  },

  // verifies filesize for uploads
  filesizeCheck: function(bytes) {
    var limit = 10;
    return (bytes/1000000 <= limit);
  }
};
