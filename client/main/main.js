(function (angular) {
  "use strict";

  angular.module('mojsart.main', [
    'ui.router',
    'mojsart.main.sidebar',
    'mojsart.main.graph',
    'mojsart.main.infopanel',
    'fx.animations',
    'ngAnimate',
  ])
  
  .config(function ($stateProvider) {
    $stateProvider
    .state('mojsart.main', {
      url: '/main',
      views:{
        'sidebar': {templateUrl: '/sidebar/sidebar.tpl.html', controller:'SideBarController'},
        'infopanel': {templateUrl: '/infopanel/infopanel.tpl.html', controller:'InfoController'},
        'graph':{templateUrl: '/graph/graph.tpl.html', controller:'GraphController'}
      }
    })
    .state('mojsart.upload', {
          url: '/upload',
          views:{
        'upload': {templateUrl: '/upload/upload.tpl.html', controller: "MainController"}
      }
    })
    .state('mojsart.about', {
          url: '/',
          views:{
        'upload': {templateUrl: '/about/about.tpl.html', controller: "MainController"}
      }
    })
    .state('mojsart.blog', {
          url: '/blog',
          views:{
        'upload': {templateUrl: '/blog/blog.tpl.html', controller: "MainController"}
      }
    });
  })

  .controller('MainController', function ($state, $scope, $http) {
    $scope.title = 'Mojsart';

    //Fetches all songs from server, adds them to SharedState.
    //Note that this function is called without a callback when app bootstraps.
    //It takes a callback (fill Songs List)
     $scope.getSongs = function (func) {
      $http.get('/song')
      .success(function(json) {
        $scope.sharedState.data = json;
        if (func){
        func(json);
        }
      });
    };

    //Gets all songs, Populates sharedScope songs array with all songs in shared state.
    //Note that this function
      $scope.fillSongsList = function(data){
        angular.forEach(data, function(song){
          $scope.sharedState.songs.push({'track': song.echoData.artist, 'title': song.echoData.title, 'echoId': song.echoData.md5});
        });
    };

    // TODO: make it so that we don't need to "initialize" like this
    $scope.sharedState = {};
    $scope.sharedState.comparing = false;
    $scope.sharedState.songs = [];
    $scope.getSongs($scope.fillSongsList);
    $scope.files = {};
    $scope.sent = false;

    //recognizes when one or more files are selected, loads them to array
    $scope.filesChanged = function(elm){
      $scope.files = elm.files;
      $scope.$apply();
      console.log($scope.files);
    };

    //Loops over $scope.files object, formats each file as FormData
    $scope.upload = function () {
      console.log($scope.files);
      var fd = new FormData();
      angular.forEach($scope.files, function (file) {
          fd.append('file', file);
      });
    //This is the Post request to add a new song. Note that it sends FormData (fd)
      $http({
          method: 'POST',
          url: '/song/send',
          data: fd,
          headers: {
              'Content-Type': undefined
          },
          transformRequest: angular.identity
      })
          .success(function (data, status, headers, config) {
          console.log("Sent:", data);
          //toggles in order to show hidden button, using ng-show in upload.tpl.html
          $scope.sent = true;
          $scope.getSongs();
      });
  };
});

})(angular);




