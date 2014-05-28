"use strict";

var Song = require('./song_model.js'),
    Q    = require('q'),
    echo = require('../main/echo.js');

module.exports = exports = {
  get: function (req, res, next) {
    Q(Song.find().exec())
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
    Q(Song.findOne({'echoData.md5': req.body.base}).exec())
    .then(function(song) {  // call SongSchema.methods.adjust on the found song after the promise returns
      song.adjust(req.body.increment);
    });

    // do similar for the song that is being compared against. note the negation
    Q(Song.findOne({'echoData.md5': req.body.compare}).exec())
    .then(function(song) {
      song.adjust(-req.body.increment);
    });
  },

  postUserData_legacy: function(req, res, next) {
    // == this is legacy code
    // TODO: need to implement functionality for artist/title instead of md5
    console.log('inside postUserData with', req.body);
    
    var base = req.body.base;
    var compare = req.body.compare;
    var increment = req.body.increment;

    Q.all([
      Song.findOne({'echoData.md5': base}).exec(),
      Song.findOne({'echoData.md5': compare}).exec()
    ]).then(function(array) {
      console.log(array);
      // console.log('calling adjust on', array[0].echoData.title, 'and', array[1].echoData.title, 'with increment', increment);

      // JON UGLY CODE STARTS HERE
      var md5 = array[0].echoData.md5;
      console.log(array[0].userData.speechiness);
      var adjust1 = (array[0].userData.speechiness) ? array[0].userData.speechiness+increment : increment;

      return Q(Song.findOneAndUpdate({'echoData.md5':md5}, {'userData.speechiness' : adjust1}).exec())
    }).then(function(song){
      console.log('updated', song);
      // return Q(Song.update(song, {'userData.speechiness' : adjust1}).exec())
    }).fail(function(err) {
      console.log(err);
    });

    // Q(Song.findOneAndUpdate({'echoData.md5': base}, {'userData.speechiness': 25}).exec())
    //   .then(function(song) {
    //     // build path to song
    //     console.log(song);
    //   })
    //   .fail(function(err) {
    //     throw(err);
    //   });

    // findOneAndUpdate Options 
    // upsert inserts if it doesnt exist in DB
    // var options = {
    //   'new': true,
    //   'upsert': true
    // };

    // i think this theoretically will work but doesn't account for i
    // calls findOneAndUpdate for the md5, responding with the new song data
    // $pFindOne(query, options)
    //   .then(function (song) {
    //     res.json(song);
    //   })
    //   .fail(function(reason){
    //     next(reason);
    //   });,
  },

  // consider breaking the below function into two requests to get an actual url with a file name
  getSong: function(req, res, next) {
    // grab md5 from request URL
    console.log('getting song');
    var md5 = req.params[0];

    Q(Song.findOne({'echoData.md5': md5}).exec())
      .then(function(song) {
        // build path to song
        var filename = song.filename;

        // build path based on server folder structure
        var dirName = __dirname+'/lib';
        var path = dirName + '/' + filename;

        // serve static audio file
        res.sendfile(path);
      })
      .fail(function(err) {
        throw(err);
      });
  },

  postSong: function(req, res, next) {
    // assume a buffer from the client 
    // fs.writefile?
  }
};
