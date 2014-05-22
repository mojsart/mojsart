(function (angular) {
  "use strict";
  angular.module('mojsart.main', ['ui.router', 'mojsart.main.note'])
  .config(function ($stateProvider) {
    $stateProvider
      .state('mojsart.main', {
        url: '/main',
        views:{
          // '': {templateUrl: 'main/main.tpl.html'},
          'sidebar': {templateUrl: 'sidebar/sidebar.tpl.html'},
          'infopanel': {templateUrl: 'infopanel/infopanel.tpl.html'},
          'graph':{templateUrl: '/graph/graph.tpl.html'}
        },
        controller: 'MainController',
      });
  })
  .controller('MainController', function ($state) {
    // $state.transitionTo('mojsart.main.note');
  });
}(angular));
