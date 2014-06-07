angular.module('mojsart.main.home', [
  'mojsart.main.sidebar',
  'mojsart.main.graph',
  'mojsart.main.home.upload',
  'mm.foundation'
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


