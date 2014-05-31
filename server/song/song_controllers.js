"use strict";

var Song = require('./song_model.js'),
    Q    = require('q'),
    echo = require('../main/echo.js'),
    fs   = require('fs'),
    helpers = require('./song_helpers.js'),
    path = require('path');

module.exports = exports = {
  get: function (req, res, next) {
    Q(Song.find({'echoData.status' : 'complete'}).exec())
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
    console.log(req);
    Q(Song.create(song).exec())
      .then(function (id) {
        res.send(id);
      })
      .fail(function (reason) {
        next(reason);
      });
  },

  postUserData: function(req, res, next) {
    /* Find a song using the client provided md5
     * .exec() promisifies the result
     * Q() transforms the promise into a Q-style promise */
     console.log('hi');
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

  // consider breaking the below function into two requests to get an actual url with a file name
  // TODO: refactor 
  getSong: function(req, res, next) {
    // grab md5 from request URL
    console.log('getting song');
    var md5 = req.params[0];

    Q(Song.findOne({'echoData.md5': md5}).exec())
      .then(function(song) {
        if (song) {
          // build path to song
          var filename = song.filename;

          // build path based on server folder structure
          var dirName = __dirname+'/lib';
          var path = dirName + '/' + filename;

          // serve static audio file
          res.sendfile(path);   
        } else {
          res.send(404);
        }
      })
      .fail(function(err) {
        throw(err);
      });
  },

  postSong: function(req, res, next) {
    var song = req.files.file;
    var type = song.type;
    var filename = song.originalFilename;

    // note: dumb upload. overwrites same file names
    // songs must have different filenames
    // TODO: increment filenames if they're found
    var regex = /^(audio\/[a-z0-9]+)$/i;
    var bool = helpers.filenameRegEx(filename) && regex.test(type);

    if (bool) {
      var serverPath = __dirname + '/lib/' + filename; 
      var $fsRename = Q.nbind(fs.rename, fs);
      $fsRename(song.path, serverPath)
        .then(function() {
          res.send(serverPath);
        })
        .fail(function(err) {
          throw(err)
        });
    } else {
      res.send(404, 'Sorry, please upload an audio file!')
    }
  },

  // sendTestPage: function(req,res,next) {
  //   res.sendfile(__dirname+'/testUploadPage.html');
  // }
};
