angular.module('mojsart.main.graph', ['ui.router'])

.config(function ($stateProvider) {

  $stateProvider
    .state('mojsart.main.graph', {
      url: '/main',
      templateUrl: 'graph/graph.tpl.html',
      controller: 'graphController'
    });
})
.controller('graphController', function ($scope) {




});
