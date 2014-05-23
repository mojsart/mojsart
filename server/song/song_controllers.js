"use strict";

var Song = require('./song_model.js'),
    Q    = require('q'),
    echo = require('../main/echo.js');

module.exports = exports = {
  get: function (req, res, next) {
    var $promise = Q.nbind(Song.find, Song);
    $promise()
      .then(function (songs) {
        res.json(songs);
      })
       .fail(function (reason) {
        next(reason);
      });
  },

  post: function (req, res, next) {
    // TODO: need to check if req.body is the entire song db entry    
    var song = req.body;
    var $promise = Q.nbind(Song.create, Song);
    $promise(song)
      .then(function (id) {
        res.send(id);
      })
      .fail(function (reason) {
        next(reason);
      });
  },

  postUserData: function(req, res, next) {
    // validate song data 
    // add to db if not  ??? do we need this for now... 
    // update database for everything in object

    // TODO: need to check if req.body is the entire song db entry
    var reqSong = req.body;
    var reqSongmd5 = req.body.echoData.md5;
    var $promise = Q.nbind(Song.findOneAndUpdate, Song);

    var query = {
      'echoData.md5': reqSong.md5
    };

    var options = {
      'new': true,
      'upsert': true
    };

    // i think this theoretically will work but doesn't account for i
    $promise(query, reqSong, options)
      .then(function (song) {
        res.json(song);
      })
      .fail(function(reason){
        next(reason);
      });
  },

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

  fetchSong: function(query) {
    // query should be something like {
    //   md5: 'cfa55a902533b32e87473c2218b39da9',
    //   bucket: 'audio_summary'
    // }

    echo('track/profile').get(query, function (err, json) {
      if (err) throw(err);
      console.log(json.response.track);
      exports.saveSong(json.response.track);
    });
  },

  saveSong: function(trackData) {
    // create a song model
    // populate with echo nest data

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

    var $promise = Q.nbind(song.save, song);
    $promise()
      .then(function(saved) {
        console.log('song saved: ', saved);
      });
  }
};
