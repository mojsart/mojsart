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
  $scope.chartData = [21,1,5];
});