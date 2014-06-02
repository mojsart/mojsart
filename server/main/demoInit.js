var Song = require('../song/song_model.js'),
    Q    = require('q'),
    echo = require('./echo.js'),
    SongHelpers = require('../song/song_helpers.js');

module.exports = exports = function(req, res) {
  SongHelpers.uploadSongs();
};
