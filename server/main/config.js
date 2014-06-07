"use strict";

var mongoose        = require('mongoose'),
    morgan          = require('morgan'),
    bodyParser      = require('body-parser'),
    methodOverride  = require('method-override'),
    middle          = require('./middleware');


mongoose.connect(process.env.CUSTOMCONNSTR_MONGOLAB_URI || 'mongodb://localhost/mojsart');
/*
 * Include all your global env variables here.
*/
module.exports = exports = function (app, express, routers) {
  app.set('port', process.env.PORT || 9000);
  app.set('base url', process.env.URL || 'http://localhost');
  app.use(morgan('dev'));
  app.use(bodyParser());
  app.use(methodOverride());
  app.use(middle.cors);
  app.use(express.static(__dirname + '/../../client'));
  app.use('/song', routers.SongRouter);
  app.use('/test', routers.TestRouter);
  app.use(middle.logError);
  app.use(middle.handleError);
};
