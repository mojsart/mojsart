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
    var song = req.body.song;
    var $promise = Q.nbind(Song.create, Song);
    $promise(song)
      .then(function (id) {
        res.send(id);
      })
      .fail(function (reason) {
        next(reason);
      });
  },

  searchSong: function(artist, title) {
    //query should be: {
    //   artist: 'artistname',
    //   title: 'titlename'
    // }
    // var $promise = Q.nbind(echo('song/search').get);
    // $promise(query)
    //   .then(function(json) {
    //     json
    //   });
  },

  uploadSong: function (query) {
    // used to upload song down the line

//   fs.readFile(location, function (err, buffer) {
//     if (err) throw(err);
//     // console.log(buffer);
//     echo('track/upload').post({
//       filetype: path.extname(location).substr(1),
//     }, 'application/octet-stream', buffer, function (err, json) {
//       if (err) throw(err);
//       console.log(json.response.track.md5);
//       res.send(200, json.response);
//       // echo('track/profile').get({
//       //   md5: json.response.track.md5,
//       //   bucket: 'audio_summary'
//       // }, function (err, json) {
//       //   if (err) throw(err);
//       //   console.log(json.response);
//       //   res.send(200, json.response);
//       // });      
//     });
//   });
  },

  fetchSong: function(query) {
    // query should be something like {
    //   md5: 'cfa55a902533b32e87473c2218b39da9',
    //   bucket: 'audio_summary'
    // }
    // console.log(echo);
    // console.log('fetch query', query);

    echo('track/profile').get(query, function (err, json) {
      if (err) throw(err);
      console.log(json);
      exports.saveSong(json.response.track);
    });

    // var $promise = Q.nbind(echo('track/profile').get);
    // console.log($promise);
    // $promise(query)
    //   .then(function (json) {
    //     // grab the track info from the response
    //     console.log('response from fetch', json.response);
    //     exports.saveSong(json.response.track);
    //   })
    //   .fail(function (reason){
    //     throw(reason);
    //   });
  },

  saveSong: function(trackData) {
    // create a song model
    // populate with echo nest data

    // TODO: implement functionality to ignore songs already in db (based on md5)

    console.log('saving', trackData);
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
      }
    });

    console.log(song);

    var $promise = Q.nbind(song.save, song);
    $promise()
      .then(function(saved) {
        console.log('song saved: ', saved);
      });
  }
};

var demoInit = function(req, res) {
  Song.find(function(err, data){
    console.log(data)
  });

  // var songArr = [
  //   'abe657f8ae463c3bcffad1edeffd39dd',
  //   'bee14af93b28fa87a1c400eae7aa91eb',
  //   'b1285f7f3cfa054e770317d5a2c818e8',
  //   '055ae3af45d74e7b5540b2d1f54e0ca7',
  //   '940109abd71f345364cad7c0da87b557',
  //   'ace6617a8a9c7a85cda950770ba57d54',
  //   'e40af321ed0a03832d74a132e9905ff4',
  //   '60f4ae28bcd5fa934790519efa2179f7',
  //   'fd51d20c7c0f0641cab9cd5960b3f7d1'
  // ];
  // var songArr = ['cfa55a902533b32e87473c2218b39da9'];
  // console.log('hi');
  // for (var i=0; i<songArr.length; i++){
  //   // console.log('fetching', songArr[i]);
  //   var query = {bucket: 'audio_summary'};
  //   query.md5 = songArr[i];
  //   console.log(query);
  //   exports.fetchSong(query);
  // }
};

demoInit();