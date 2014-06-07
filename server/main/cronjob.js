// Cron for loading songs to db
var CronJob   = require('cron').CronJob,
    upload    = require('../song/song_upload.js'),
    del       = require('../song/song_delete.js');

// start cron job
// cronjob currently set to 1 min - need to decide on an actual time
var uploadjob = new CronJob('*/5 * * * *', function () {
  upload.uploadSongs();
});

var deletejob = new CronJob('*/20 * * * *', function () {
  del.deleteSongs();
});

module.exports = exports = function(req, res) {
  uploadjob.start();
  // deletejob.start();
};
