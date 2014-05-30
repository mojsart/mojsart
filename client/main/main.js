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
        // '': {templateUrl: 'main/main.tpl.html'},
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

    $scope.getSongs = function () {
      $http.get('/song')
      .success(function(json) {
        // console.log(json);
        $scope.sharedState.data = json;
      });
    };
    // TODO: make it so that we don't need to "initialize" like this
    $scope.sharedState = {};
    $scope.getSongs();
    $scope.files = {};
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

      //This is the Post request to add a new song
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
          $scope.getSongs();
      });
  };
});

})(angular);




