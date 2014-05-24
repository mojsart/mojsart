(function (angular) {
  "use strict";
  angular.module('mojsart.main', ['ui.router', 'mojsart.main.sidebar', 'mojsart.main.graph','mojsart.main.infopanel'])
  .config(function ($stateProvider) {
    $stateProvider
      .state('mojsart.main', {
        url: '/main',
        views:{
          // '': {templateUrl: 'main/main.tpl.html'},
          'sidebar': {templateUrl: 'sidebar/sidebar.tpl.html', controller:'SideBarController'},
          'infopanel': {templateUrl: 'infopanel/infopanel.tpl.html', controller:'InfoController'},
          'graph':{templateUrl: '/graph/graph.tpl.html', controller:'GraphController'}
        },
        controller: 'MainController',
      });
  })
  .controller('MainController', function ($state, $scope, $http) {
  $scope.getSongs = function () {
    $http.get('/song')
    .success(function(json) {
      console.log(json);
      $scope.sharedState.data = json;
    });
  };
  $scope.getSongs();
    $scope.sharedState = {};
    // $scope.sharedStare.on('change', function() {console.log('change');}); // this doesn't work
    // $state.transitionTo('mojsart.main.note');
  });
}(angular));
