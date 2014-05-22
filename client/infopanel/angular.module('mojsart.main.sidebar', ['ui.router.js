angular.module('mojsart.main.infopanel', ['ui.router'])

.config(function ($stateProvider) {

  $stateProvider
    .state('mojsart.main.infopanel', {
      url: '/main',
      templateUrl: 'infopanel/infopanel.tpl.html',
      controller: 'infopanelController'
    });
})
.controller('infopanelController', function ($scope) {
  $scope.songinfo = ['Info','About','Songs', 'goes', 'here'];
});


