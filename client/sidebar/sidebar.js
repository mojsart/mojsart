angular.module('mojsart.main.sidebar', ['ui.router'])

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

  $scope.countUp = function(song){
    var package = {};
    package.base = $scope.sharedState.md5;
    package.compare = song.echoId;
    package.increment = +1;
    return package;
  };
      //Covers case where user says song is "LESS x than clicked-node"

  $scope.countDown = function(song){
    var package = {};
    package.base = $scope.sharedState.md5;
    package.compare = song.echoId;
    package.increment = -1;
    return package;
  };


});
