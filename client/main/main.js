(function (angular) {
  "use strict";
  angular.module('mojsart.main', ['ui.router', 'mojsart.main.note', 'mojsart.main.sidebar', 'mojsart.main.graph','mojsart.main.infopanel'])
  .config(function ($stateProvider) {
    $stateProvider
      .state('mojsart.main', {
        url: '/main',
        views:{
          // '': {templateUrl: 'main/main.tpl.html'},
          'sidebar': {templateUrl: 'sidebar/sidebar.tpl.html', controller:'SideBar'},
          'infopanel': {templateUrl: 'infopanel/infopanel.tpl.html', controller:'InfoController'},
          'graph':{templateUrl: '/graph/graph.tpl.html', controller:'GraphController'}
        },
        controller: 'MainController',
      });
  })
  .controller('MainController', function ($state) {
    // $state.transitionTo('mojsart.main.note');
  });
}(angular));
