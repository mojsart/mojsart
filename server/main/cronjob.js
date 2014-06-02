// Cron for loading songs to db
var CronJob = require('cron').CronJob; 
var SongHelpers = require('../song/song_helpers.js');

// start cron job
// cronjob currently set to 1 min - need to decide on an actual time
var job = new CronJob('*/1 * * * *', function () {
  // console.log('cronjob');
  SongHelpers.uploadSongs();
});

module.exports = exports = function(req, res) {
  // console.log('starting job');
  job.start();
};
