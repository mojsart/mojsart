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
  $scope.quantity = 5;

//Fetches all songs when app starts, loads Track and Title into Songs Array
// TODO: delegate to parent's scope getSongs with a cb
 $scope.fillSidebar = function(){
    $scope.getSongs(function(data){
    for (var i = 0; i < data.length; i++){
        $scope.songs.push({'track': data[i].echoData.artist, 'title': data[i].echoData.title, 'echoId': data[i].echoData.md5});
      }
  });
};
  $scope.fillSidebar();

  // set up listener for re-get, and fires get songs. TODO: don't put this in the controller
  socket.on('reget', function() {
    console.log('regetting');
    $scope.getSongs(function() {

    });
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
//Removes clicked song from songs array, automatically refreshing list of songs in sidepanel view
  $scope.cycleVote = function(song){
    $scope.songs.shift();
    console.log('moving song out of list');
    // $scope.addClass('fx-fade-up');
  };


});
