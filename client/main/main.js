(function (angular) {
  "use strict";

  angular.module('mojsart.main', [
    'ui.router',
    'mojsart.main.sidebar',
    'mojsart.main.graph',
    'mojsart.main.infopanel',
    'fx.animations',
    'ngAnimate'
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
    }).state('mojsart.upload', {
          url: '/upload',
          views:{
        // '': {templateUrl: 'main/main.tpl.html'},
        'sidebar': {templateUrl: '/upload/upload.tpl.html', controller:'UploadController'}
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



    $scope.toggleModal = function(){
      console.log('inside main control')
    }
    };

    // TODO: make it so that we don't need to "initialize" like this
    $scope.sharedState = {};
    $scope.getSongs();

  });
})(angular);
