"use strict";

var express = require('express');
var app = express();
var routers = {};
var SongRouter = express.Router();


routers.SongRouter = SongRouter;

require('./config.js')(app, express, routers);

require('../song/song_routes.js')(SongRouter);

//initialize the demo with hard-coded song -- see demoInit.js
require('./demoInit.js')();

module.exports = exports = app;
