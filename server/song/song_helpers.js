"use strict";

var Song = require('./song_model.js'),
    Q    = require('q'),
    echo = require('../main/echo.js'),
    fs = require('fs'),
    path = require('path');

module.exports = exports = {

  // TODO: promisify, async, refactor -- callback hell... 
  uploadSongs: function() {
    // console.log('uploading songs');
    var dirName = __dirname+'/lib';
    var responseArr = [];

    // read song directory on server
    fs.readdir(dirName, function(err, files) {
      // for each song on the server
      for (var i = 0; i < files.length; i++) {
        (function(count) {
          // check the database to see if the file exists
          // only proceed for files who pass the regex filter filenameRegEx
          // TODO: need to ignore things besides DS_Store
          if(exports.filenameRegEx(files[count])) {
            exports.checkSongFilenameDB(files[count], function(filename) {
              if (err) throw(err);
              var location = dirName + '/' + filename;
              // console.log(location);

              //check if filename in db before initializing a send
              exports.checkSongFilenameDB(filename, function(filename) { 
                fs.readFile(location, function(err, buffer) {
                  console.log(buffer);
                  if (err) throw (err);
                  // upload to echo nest
                  echo('track/upload').post({
                    filetype: path.extname(location).substr(1)
                  }, 'application/octet-stream', buffer, function(err, json) {
                    if (err) throw(err);
                    console.log(json.response.track);
                    // as soon as a response is received - check to see if it's already in db
                    exports.checkSongFilenameDB(filename, function(filename) { 
                      // save the pending processing song WITHOUT md5
                      exports.saveSong(json.response.track, filename);
                      // begin checking if md5 is there
                      exports.checkSongMD5DB(json.response.track.md5, function(md5) {
                        // if the song is not found 
                        (function(md5) {
                          // set to check echonest every 2 seconds to see if the song has been processed by echonest
                          var waittime = 4000;
                          var interval = setInterval(function(md5){
                            // console.log('checking md5', md5)
                            var query = {bucket: 'audio_summary', md5: md5};
                            // arguments : query with the desired md5, boolean to state whether there is a boolean
                            // filename to save, and the interval object which is needed to clearInterval
                            exports.fetchSongMD5(query, false, filename, interval);                    
                          }, waittime, md5);
                        })(md5);
                      });
                    });
                  });
                });   
              });
            })
          }
        })(i);
      }
    });
  },

  fetchSongMD5: function(query, bool, filename, interval) {
    // query should be something like {
    //   md5: 'cfa55a902533b32e87473c2218b39da9',
    //   bucket: 'audio_summary'
    // }

    // queries echoapi for the md5 we are looking for
    // console.log('query', query);

    console.log('fetching');
    echo('track/profile').get(query, function (err, json) {
      if (err) throw(err);
      // returns a response referenced here: http://developer.echonest.com/docs/v4/track.html#profile
      // console.log(json.response.track);
      // calls SaveSongMD5 if processing is complete
      console.log(json);
      if (json.response.track.status === "complete") {
        console.log('analysis complete');
        exports.updateSong(json.response.track, filename);
        if (bool === false) {
          console.log('setting bool to true');
          bool = true;
        }
      }
      if (bool) {
        console.log('clearing interval');
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
        console.log('song saved: ', saved);
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
        console.log('song saved');
      });
  },

  checkSongMD5DB: function(md5, cb) {
    Q(Song.findOne({'echoData.md5': md5}).exec())
      .then(function(song) {
        if (!song) {
          cb(md5);
        }
      })
      .fail(function(reason) {
        console.log(reason);
      });
  },

  checkSongFilenameDB: function(filename, cb) {
    Q(Song.findOne({'filename': filename}).exec())
      .then(function(song) {
        if (!song) {
          cb(filename);
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
