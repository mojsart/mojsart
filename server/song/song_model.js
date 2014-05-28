"use strict"; 

var mongoose = require('mongoose');

var SongSchema = new mongoose.Schema({
  echoData: {
    artist: String,
    title: String,
    // md5 for uploaded songs
    md5: String,
    // id for the rest
    id: String,
    status: String,
    audio_summary: {
      danceability: Number,
      duration: Number,
      energy: Number,
      key: Number,
      loudness: Number,
      speechiness: Number,
      acousticness: Number,
      liveness: Number,
      tempo: Number
    }
  },
  // TODO: Allow User Data
  userData: {
    speechiness: Number,
    acousticness: Number
  },
  filename: String
});

SongSchema.methods.adjust = function(increment) {
  console.log('Adjusting', this.echoData.title, 'with increment', increment);
  var tmp = this.userData.speechiness;
  this.userData.speechiness += increment;
  console.log('Adjusted speechiness from', tmp, 'to', this.userData.speechiness);
  return this.save();
};

module.exports = exports = mongoose.model('Song', SongSchema);
