"use strict";

var Song = require('./song_model.js'),
    Q    = require('q'),
    echo = require('../main/echo.js'),
    fs   = require('fs'),
    helpers = require('./song_helpers.js'),
    nodePath = require('path');

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
    var md5 = req.params[0];
    console.log('trying to play', md5)
    Q(Song.findOne({'echoData.md5': md5, 'cached': true}).exec())
      .then(function(song) {
        console.log(song);
        if (song) {
          // build path to song
          var filename = song.filename;
          // build path based on server folder structure
          var dirName = nodePath.join(__dirname, 'lib');
          var path = nodePath.join(dirName, filename);
          console.log(path);
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
    console.log('receiving song', req.files);
    var song = req.files.file;
    var size = req.files.file.ws.bytesWritten;
    var type = song.type;
    var filename = song.originalFilename;

    // TODO: increment filenames if they're found
    var regex = /^(audio\/[a-z0-9]+)$/i;
    var bool = helpers.filesizeCheck(size) && helpers.filenameRegEx(filename) && regex.test(type);

    // https://www.npmjs.org/package/formidable
    console.log(bool);

    if (bool) {
      var serverPath = path.join(__dirname, 'lib', filename); 
      var $fsWriteFile = Q.nbind(fs.writeFile, fs);
      var $fsReadFile = Q.nbind(fs.readFile, fs);
      console.log(serverPath);
      console.log(song);

      $fsReadFile(song.path)
        .then(function(buffer) {
          console.log(buffer);
          $fsWriteFile(serverPath, buffer)
            .then(function() {
              console.log('writing');
              fs.unlink(song.path, function(err) {
                helpers.callbackError(err);
                console.log('temp file deleted');
                res.send(serverPath);
              });
            });
        })
        .fail(function(err) {
          console.log('error stuff');
          throw(err);
        });
    } else {
      res.send(404, 'Sorry, please upload a .mp3 under 10 MB')
    }
  }
};
