"use strict";

var Song = require('./song_model.js'),
    Q    = require('q'),
    echo = require('../main/echo.js'),
    fs = require('fs'),
    path = require('path');

module.exports = exports = {

  // in progress - echonest api currently broken
  uploadSongs: function () {
    // TODO: change to promises

    var dirName = __dirname+'/lib';
    var responseArr = [];

    // TODO: promisify
    fs.readdir(dirName, function(err, files) {
      if (err) throw(err);
      for (var i = 0; i < files.length; i++) {
        (function(count) {
          var location = dirName + '/' + files[count];
          console.log('location', location);
          console.log('filename', files[count]);
          fs.readFile(location, function(err, buffer) {
            if (err) throw(err);
            console.log('read file', buffer);

            echo('track/upload').post({
              filetype: path.extname(location).substr(1)
            }, 'application/octet-stream', buffer, function (err, json) {
              console.log('sending to echo');
              if (err) throw(err);
              console.log(json.response.track.md5);

              // need to find a better way of doing this
              // does this even work how i think it does
              // TODO: should we save entire location?
              setInterval(function(md5){
                fetchSongMD5(md5, false, files[count]);
              }, 2000, json.response.track.md5);
            });
          });
        })(i);
      }
    });
  },

  // in progress - need to make updates for id
  fetchSongArtistTitle: function(query) {
    // query should be something like {
    // artist: 'artistname',
    // title: 'titlename',
    // bucket: 'audio_summary'
    // }

    echo('song/search').get(query, function (err, json) {
      if (err) throw(err);
      // grabs top result from results array
      console.log(json.response.songs[0]);
      exports.saveSongArtistTitle(json.response.song[0]);
    });
  },

  // in progress - need to make updates for id
  saveSongArtistTitle: function(trackData) {
    var song = new Song({
      echoData: {
        artist: trackData.artist_name,
        title: trackData.title,
        id: trackData.id,
        // ?? how do we get status
        // status: trackData.status,
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
      }
    });

    var $promise = Q.nbind(song.save, song);
    $promise()
      .then(function(saved) {
        console.log('song saved: ', saved);
      });
  },

  fetchSongMD5: function(query, bool, filename) {
    // query should be something like {
    //   md5: 'cfa55a902533b32e87473c2218b39da9',
    //   bucket: 'audio_summary'
    // }

    // queries echoapi for the md5 we are looking for
    echo('track/profile').get(query, function (err, json) {
      if (err) throw(err);
      // returns a response referenced here: http://developer.echonest.com/docs/v4/track.html#profile
      console.log(json.response.track);
      // calls SaveSongMD5 if processing is complete
      if (json.response.track.status === "complete") {
        // TODO: test filename
        exports.saveSongMD5(json.response.track, filename);
        if (bool === false) {
          bool = true;
        }
      }
      if (bool) {
        clearInterval();
      }
    });
  },

  saveSongMD5: function(trackData, filename) {
    // create a song model
    // populate with echo nest data

    // initializes a new instance of song with the received trackData
    // TODO: test filename
    var song = new Song({
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
    });

    // saves to our mongoose database if it doesn't exist
    var $promise = Q.nbind(song.save, song); // JH: apparently you can't do Q(song.save().exec())...
    $promise()
      .then(function(saved) {
        console.log('song saved: ', saved);
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
};