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
      console.log($scope.data[0].echoData.artist);
      for (var i = 0; i < $scope.data.length; i++){
        $scope.songs.push({'track': $scope.data[i].echoData.artist, 'title': $scope.data[i].echoData.title});
      }
    });
});


