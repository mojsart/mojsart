"use strict";

/*
 *
 * Entry file into the server
 * @app -
 *    our express app. Exported for testing and flexibility.
 *
*/

var app   = require('./server/main/app.js'),
    http = require('http').Server(app),
    io = require('socket.io')(http),
    port  = app.get('port'),
    log   = 'Listening on ' + app.get('base url') + ':' + port;

http.listen(port);
console.log(log);

io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('postUserData', function() {
    console.log('postUserData')
    io.emit('reget');
  });
});
