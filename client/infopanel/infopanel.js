angular.module('mojsart.main.infopanel', ['ui.router'])

.config(function ($stateProvider) {

  $stateProvider
    .state('mojsart.main.infopanel', {
      url: '/main',
      templateUrl: 'infopanel/infopanel.tpl.html',
      controller: 'InfoController'
    });
})
.controller('InfoController', function ($scope, $firebase) {
  console.log('inside info controller');
  var songNames = new Firebase('https://mojsart-test.firebaseio.com/')
  $scope.songinfo = ['Info','About','Songs', 'goes', 'here'];
});


