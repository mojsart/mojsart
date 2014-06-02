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
  uploadSongs: function() {
    fs.readdir(exports.dirName, function(err, files) {
      async.each(files, exports.validateFileType, exports.callbackError);
    });
  },

  // validate songtype using regex filter and check if filename is found in db
  validateFileType: function(file, callback) {
    if(exports.filenameRegEx(file)) {
      console.log('hello');
      exports.checkSongNotInDB('filename', file, exports.echoUpload)
    }
  },

  // send song to echo nest
  echoUpload: function(filename) {
    var location = exports.dirName + '/' + filename;
    var filetype = path.extname(location).substr(1).toLowerCase();
    fs.readFile(location, function(err, buffer) {
      exports.callbackError(err);
      echo('track/upload').post({
        filetype: filetype             
      }, 'application/octet-stream', buffer, function(err, json) {
        exports.handleEchoResponse(err, json, filename);
      });
    });   
  },

  // handle echo nest response
  // 1. check if song filename in db
  // 2. save pending processing song in db
  // 3. check to make sure the song hasn't already been processed in the async
  // 4. start echo nest interval 
  handleEchoResponse: function(err, json, filename) {
    exports.callbackError(err);
    exports.checkSongNotInDB('filename', filename, function(filename) { 
      exports.saveSong(json.response.track, filename);
      exports.checkSongNotInDB('echoData.md5', json.response.track.md5, function(md5) {
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
      exports.echoFetchMD5(query, false, filename, interval);                    
    }, waittime, md5);
  },

  callbackError: function(err) {
    if (err) console.log(err);
  },

  // handle pending in db

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
      filename: filename
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
      filename: filename
    };

    Q(Song.update({'filename' : filename}, update).exec())
      .then(function(saved) {
        console.log('song updated');
      });
  },

  checkSongNotInDB: function(searchField, input, cb) {
    // for MD5: searchField = 'echoData.md5'
    // for filename: searchField = 'filename'
    var query = {};
    query[searchField] = input
    Q(Song.findOne(query).exec())
      .then(function(song) {
        if (!song) {
          cb(input);
        }
      })
      .fail(function(reason) {
        console.log(reason);
      });
  },

  filenameRegEx: function(filename) {
    // var match = /^(.*\.(?!(mp3|mp4|wav|au|ogg|m4a|mp4)$))?[^.]*$/i;
    var match = /^(.*\.(?!(mp3)$))?[^.]*$/i;
    return(!match.test(filename));
  }
};
