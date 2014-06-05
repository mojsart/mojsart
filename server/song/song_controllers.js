"use strict";

var Song = require('./song_model.js'),
    Q    = require('q'),
    echo = require('../main/echo.js'),
    fs   = require('fs'),
    helpers = require('./song_helpers.js'),
    nodePath = require('path');

module.exports = exports = {
  // returns song data for songs that have a completed status
  get: function (req, res, next) {
    Q(Song.find({'echoData.status' : 'complete'}).exec())
      .then(function (songs) {
        res.json(songs);
      })
       .fail(function (reason) {
        next(reason);
      });
  },

  // posts user feedback into song object
  postUserData: function(req, res, next) {
    /* Find a song using the client provided md5
     * .exec() promisifies the result
     * Q() transforms the promise into a Q-style promise */
    if (req.body.base) {
      Q(Song.findOne({'echoData.md5': req.body.base}).exec())
      .then(function(song) {  // call SongSchema.methods.adjust on the found song after the promise returns
        song.adjust(req.body.increment);
      });
      // do similar for the song that is being compared against. note the negation
      Q(Song.findOne({'echoData.md5': req.body.compare}).exec())
      .then(function(song) {
        song.adjust(-req.body.increment);
      });
      res.send(200);  
    } else {
      res.send(404);
    }
  },

  // serves songs when requested by client
  getSong: function(req, res, next) {
    // grab md5 from request URL
    var md5 = req.params[0];
    Q(Song.findOne({'echoData.md5': md5, 'cached': true}).exec())
      .then(function(song) {
        if (song) {
          // build path to song
          var filename = song.filename;
          // build path based on server folder structure
          var path = nodePath.join(__dirname, 'lib', filename);
          // serve static audio file
          res.sendfile(path);   
        } else {
          res.send(404, 'Song is not available to be played');
        }
      })
      .fail(function(err) {
        throw(err);
      });
  },

  // serves post requests to the server when sent mp3 files
  postSong: function(req, res, next) {
    console.log('receiving song', req.files);
    var song = req.files.file;
    var size = req.files.file.ws.bytesWritten;
    var type = song.type;
    var filename = song.originalFilename;
    var regex = /^(audio\/[a-z0-9]+)$/i;
    var bool = helpers.filesizeCheck(size) && helpers.filenameRegEx(filename) && regex.test(type);
    if (bool) {
      var serverPath = nodePath.join(__dirname, 'lib', filename); 
      helpers.postSongSave(song.path, serverPath, function(path){ res.send(path); });
    } else {
      res.send(404, 'Sorry, please upload a .mp3 under 10 MB')
    }
  }
};
