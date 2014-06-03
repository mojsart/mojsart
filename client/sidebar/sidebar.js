angular.module('mojsart.main.sidebar', ['ui.router', 'fx.animations',
    'ngAnimate'])

.config(function ($stateProvider) {

  $stateProvider
    .state('mojsart.main.sidebar', {
      url: '/main',
      templateUrl: 'sidebar/sidebar.tpl.html',
      controller: 'SideBarController'
    });
})

.controller('SideBarController', function ($scope, $http) {
  $scope.buttonStatus =  'full';
  $scope.songs = [];
  $scope.quantity = 3;
  $scope.comparing = false;

//Fetches all songs when app starts, loads Track and Title into Songs Array
  // set up listener for re-get, and fires get songs. TODO: don't put this in the controller
  $scope.filterSongsList = function (song) {
      if (song.title === $scope.sharedState.title){
        return false;
      } else {
        return true;
      }
    };

  socket.on('reget', function() {
    console.log('regetting');
    $scope.getSongs();
  });
  


    //returns an object comparing clicked-node song to another song in DB.
    //Covers both positive and negative comparisons."

  $scope.postVote = function(song, upOrDown){
    var package = {};
    package.base = $scope.sharedState.md5;
    package.compare = song.echoId;
    if(upOrDown === 'up') {
      package.increment = 1;
    } else if(upOrDown === 'down') {
      package.increment = -1;
    }
    console.log('Attemping to post vote for', package.base, 'vs', package.compare);
    $http.post('/song', package).success(function () {
      console.log('Successfully posted', package.base, 'vs', package.compare);
      socket.emit('postUserData');
      $scope.cycleVote(song);
    });
  };
//Removes clicked song from songs array. This automatically refreshes sidebar.
  $scope.cycleVote = function(song){
    $scope.sharedState.songs.shift();
  };


});
