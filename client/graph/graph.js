angular.module('mojsart.main.graph', ['ui.router'])

.config(function ($stateProvider) {

  $stateProvider
    .state('mojsart.main.graph', {
      url: '/main',
      templateUrl: 'graph/graph.tpl.html',
      controller: 'GraphController'
    });
})
.controller('GraphController', function ($scope, $http) {
  $http.get('/song')
    .success(function(json) {
      console.log(json);
      $scope.data = json;
    });
});

/*  var song1 = {
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
  };*/
