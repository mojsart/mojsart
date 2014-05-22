"use strict";

var express = require('express');
var app = express();
var routers = {};
var NoteRouter = express.Router();
routers.NoteRouter = NoteRouter;

require('./config.js')(app, express, routers);

require('../note/note_routes.js')(NoteRouter);

module.exports = exports = app;