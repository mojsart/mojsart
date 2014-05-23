angular.module('mojsart.main.graph', ['ui.router'])

.config(function ($stateProvider) {

  $stateProvider
    .state('mojsart.main.graph', {
      url: '/main',
      templateUrl: 'graph/graph.tpl.html',
      controller: 'GraphController'
    });
})
.controller('GraphController', function ($scope) {

  var song1 = {
    speechiness: 0.2,
    acousticness: 0.5,
    energy: 0.8,
    danceability: 0.9
  };
  console.log('in graph controller')

  var song2 = {
    speechiness: 0.4,
    acousticness: 0.3,
    energy: 0.6,
    danceability: 0.6
  };
  $scope.data = [song1, song2];

});
