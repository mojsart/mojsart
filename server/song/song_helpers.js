"use strict";

var Song = require('./song_model.js'),
    Q    = require('q'),
    echo = require('../main/echo.js'),
    fs = require('fs'),
    nodePath = require('path'),
    async = require('async');

module.exports = exports = {
  dirName: nodePath.join(__dirname, 'lib'), 
  // starting point for upload songs, read all songs in library
  readDirEach: function(func) {
    Q.nfcall(fs.readdir, exports.dirName)
      .then(function(files) {
        async.each(files, func, exports.callbackError);
      })
      .fail(exports.callbackError);
  },

  // TODO: handle pending in db
  // fetches song from echo nest, starts a set interval to ping echo nest for updated data
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

  // create a song model populated with prelim echo nest data
  // initializes a new instance of song with the received trackData
  saveSong: function(trackData, filename) {
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

  // updates song information with retrieved echo nest data
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

  // checks if a song is found in the database. calls callback based on result.
  checkSongNotInDB: function(searchField, input, notfoundcb, foundcb) {
    // for MD5: searchField = 'echoData.md5'
    // for filename: searchField = 'filename'
    var query = {};
    query[searchField] = input
    Q(Song.findOne(query).exec())
      .then(function(song) {
        if (!song) {
          notfoundcb(input);
        } else { 
          if (foundcb) {
            foundcb(input);
          }
        }
      })
      .fail(function(reason) {
        console.log(reason);
      });
  },

  // nodestyle error handling
  callbackError: function(err) {
    if (err) throw err;
  },

  // checks filenames for .mp3 extension
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

  // reads files from one location, writes to a new location, and deletes from old location
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
