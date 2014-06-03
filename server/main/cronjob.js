// Cron for loading songs to db
var CronJob = require('cron').CronJob; 
var upload = require('../song/song_upload.js');
var del = require('../song/song_delete.js');

// start cron job
// cronjob currently set to 1 min - need to decide on an actual time
var uploadjob = new CronJob('*/1 * * * *', function () {
  // console.log('cronjob');
  upload.uploadSongs();
});

var deletejob = new CronJob('*/20 * * * *', function () {
  // console.log('cronjob');
  del.deleteSongs();
});

module.exports = exports = function(req, res) {
  // console.log('starting job');
  uploadjob.start();
  // deletejob.start();
};
