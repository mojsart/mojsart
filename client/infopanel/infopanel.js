angular.module('mojsart.main.infopanel', ['ui.router'])

.config(function ($stateProvider) {

  $stateProvider
    .state('mojsart.main.infopanel', {
      url: '/main',
      templateUrl: 'infopanel/infopanel.tpl.html',
      controller: 'InfoController'
    });
})
.controller('InfoController', function ($scope) {
  console.log('inside info controller');
  $scope.songinfo = ['Info','About','Songs', 'goes', 'here'];
});


