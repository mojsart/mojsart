(function (angular) {
  "use strict";
  angular.module('mojsart.main', ['ui.router', 'mojsart.main.note'])
  .config(function ($stateProvider) {
    $stateProvider
      .state('mojsart.main', {
        url: '/main',
        templateUrl: 'main/main.tpl.html',
        controller: 'MainController'
      });
  })
  .controller('MainController', function ($state) {
    $state.transitionTo('mojsart.main.note');
  });
}(angular));
