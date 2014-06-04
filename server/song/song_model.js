"use strict"; 

var mongoose = require('mongoose');

var SongSchema = new mongoose.Schema({
  echoData: {
    artist: String,
    title: String,
    md5: String,
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
  userData: {
    speechiness: Number,
    acousticness: Number
  },
  filename: String,
  cached: Boolean
});

SongSchema.methods.adjust = function(increment) {
  console.log('Adjusting', this.echoData.title, 'with increment', increment);
  var tmp = this.userData.speechiness;
  this.userData.speechiness +=  0.05 * increment;
  console.log('Adjusted speechiness from', tmp, 'to', this.userData.speechiness);
  return this.save();
};

module.exports = exports = mongoose.model('Song', SongSchema);
