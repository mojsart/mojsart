"use strict";

var Song = require('./song_model.js'),
    Q    = require('q'),
    echo = require('../main/echo.js');

module.exports = exports = {
  uploadSong: function (query) {
    // TODO: implement uploading songs at some point

    // fs.readFile(location, function (err, buffer) {
    //   if (err) throw(err);
    //   // console.log(buffer);
    //   echo('track/upload').post({
    //     filetype: path.extname(location).substr(1),
    //   }, 'application/octet-stream', buffer, function (err, json) {
    //     if (err) throw(err);
    //     console.log(json.response.track.md5);
    //     res.send(200, json.response);
    //     echo('track/profile').get({
    //       md5: json.response.track.md5,
    //       bucket: 'audio_summary'
    //     }, function (err, json) {
    //       if (err) throw(err);
    //       console.log(json.response);
    //       res.send(200, json.response);
    //     });      
    //   });
    // });
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

  fetchSongMD5: function(query) {
    // query should be something like {
    //   md5: 'cfa55a902533b32e87473c2218b39da9',
    //   bucket: 'audio_summary'
    // }

    // queries echoapi for the md5 we are looking for
    echo('track/profile').get(query, function (err, json) {
      if (err) throw(err);
      // returns a response referenced here: http://developer.echonest.com/docs/v4/track.html#profile
      console.log(json.response.track);
      // calls SaveSongMD5
      exports.saveSongMD5(json.response.track);
    });
  },

  saveSongMD5: function(trackData) {
    // create a song model
    // populate with echo nest data

    // initializes a new instance of song with the received trackData
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
      }
    });

    // saves to our mongoose database if it doesn't exist
    var $promise = Q.nbind(song.save, song);
    $promise()
      .then(function(saved) {
        console.log('song saved: ', saved);
      });
  }, 

  checkSongMD5DB: function(md5, cb) {
    var $promiseDBFindOne = Q.nbind(Song.findOne, Song);
      $promiseDBFindOne({'echoData.md5': md5})
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