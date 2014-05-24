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

    // fetches md5 
    // TODO: need to implement functionality for id if needed
    var reqSongmd5 = req.body.echoData.md5;

    // initializes promise for Song.findOneAndUpdate
    var $promise = Q.nbind(Song.findOneAndUpdate, Song);

    //search query based on md5
    // TODO: need to implement functionality for id
    var query = {
      'echoData.md5': reqSong.md5
    };

    // findOneAndUpdate Options 
    // upsert inserts if it doesnt exist in DB
    var options = {
      'new': true,
      'upsert': true
    };

    // i think this theoretically will work but doesn't account for i
    // calls findOneAndUpdate for the md5, responding with the new song data
    $promise(query, reqSong, options)
      .then(function (song) {
        res.json(song);
      })
      .fail(function(reason){
        next(reason);
      });
  }
};
