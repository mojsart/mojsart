angular.module('mojsart.main.home', [
  'ui.router',
  'fx.animations',
  'mojsart.main.sidebar',
  'mojsart.main.graph',
  'mojsart.main.infopanel',
  'ngAnimate'
])

.config(function ($stateProvider) {

  $stateProvider
    .state('mojsart.main', {
      url: '/main',
      views: {
        'sidebar': {templateUrl: '/sidebar/sidebar.tpl.html', controller:'SideBarController'},
        'graph':{templateUrl: '/graph/graph.tpl.html', controller:'GraphController'}
      }
    });
});