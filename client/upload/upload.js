angular.module('mojsart.upload', ['ui.router', 'fx.animations',
    'ngAnimate'])

.config(function ($stateProvider) {

  $stateProvider
    .state('mojsart.upload', {
      url: '/upload',
      templateUrl: 'upload/upload.tpl.html',
      controller: 'UploadController'
    });
})

.controller('UploadController', function ($scope, $http) {
  $scope.buttonStatus =  'full';
  $scope.songs = [];
  $scope.quantity = 5;


//Fetches all songs when app starts, loads Track and Title into Songs Array
  $http.get('/song')
    .success(function(json) {
      $scope.data = json;
      console.log($scope.data[0]);
      for (var i = 0; i < $scope.data.length; i++){
        $scope.songs.push({'track': $scope.data[i].echoData.artist, 'title': $scope.data[i].echoData.title, 'echoId': $scope.data[i].echoData.md5});
      }
    });

    //returns an object comparing clicked-node song to another song in DB.
    //Covers case where user says song is "MORE x than clicked-node"

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
    });
  };
//Removes clicked song from songs array, automatically refreshing list of songs in sidepanel view
  $scope.cycleVote = function(song){
    $scope.songs.shift();
    console.log('moving song out of list');
    // $scope.addClass('fx-fade-up');
  };


});