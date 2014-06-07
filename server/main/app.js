"use strict";

var express     = require('express'),
    app         = express(),
    routers     = {},
    SongRouter  = express.Router(),
    TestRouter  = express.Router();

routers.SongRouter = SongRouter;
routers.TestRouter = TestRouter;

require('./config.js')(app, express, routers);

// routes
require('../song/song_routes.js')(SongRouter);
require('./test_routes.js')(TestRouter);

require('./cronjob.js')();

module.exports = exports = app;