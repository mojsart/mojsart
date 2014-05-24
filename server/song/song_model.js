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
  uri: String
});

module.exports = exports = mongoose.model('Song', SongSchema);