"use strict";

var express = require('express');
var app = express();
var routers = {};
var SongRouter = express.Router();

routers.SongRouter = SongRouter;

require('./config.js')(app, express, routers);

require('../song/song_routes.js')(SongRouter);

require('./demoInit.js')();
require('./cronjob.js')();

module.exports = exports = app;
