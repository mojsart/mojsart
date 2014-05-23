angular.module('mojsart.main.note', ['ui.router'])

.config(function ($stateProvider) {

  $stateProvider
    .state('mojsart.main.note', {
      url: '/notes',
      templateUrl: 'note/note.tpl.html',
      controller: 'NoteController'
    });
})
.controller('NoteController', function ($scope) {
  $scope.notes = [];
  var song1 = {
    speechiness: 0.2,
    acousticness: 0.5,
    energy: 0.8,
    danceability: 0.9
  };

  var song2 = {
    speechiness: 0.4,
    acousticness: 0.3,
    energy: 0.6,
    danceability: 0.6
  };
  $scope.data = [song1, song2];
  // $scope.data = [12, 2, 31];
});