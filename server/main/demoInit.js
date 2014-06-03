var Song = require('../song/song_model.js'),
    Q    = require('q'),
    echo = require('./echo.js'),
    upload = require('../song/song_upload.js');

module.exports = exports = function(req, res) {
  upload.uploadSongs();
};
