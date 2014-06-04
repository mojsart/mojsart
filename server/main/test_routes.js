"use strict";

var upload = require('../song/song_upload.js');
var del = require('../song/song_delete.js')

module.exports = exports = function (router) {
  router.route('/upload')
    .get(upload.uploadSongs);

  router.route('/delete')
    .get(del.deleteSongs);
};



