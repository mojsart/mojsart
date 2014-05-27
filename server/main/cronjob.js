// Cron for loading songs to db
var CronJob = require('cron').CronJob; 
var SongHelpers = require('../song/song_helpers.js');

// start cron job
var job = new CronJob('*/5 * * * *', function () {
  console.log('cronjob');
  SongHelpers.uploadSongs();
});

// console.log(job);
module.exports = exports = function(req, res) {
  job.start();
};
