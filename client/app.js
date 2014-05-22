(function (angular) {
  "use strict";
  angular.module('mojsart', [
    'fx.animations',
    'ngAnimate',
    // 'ngTouch',
    // 'ngCookies',
    'ui.router',
    'mojsart.main'])
  .config(function ($stateProvider) {
    $stateProvider
      .state('mojsart', {
        url: '/mojsart',
        abstract: true,
        templateUrl: 'main/main.tpl.html',
        controller: 'MainController',
      });
  })
  .run(function ($state) {
    $state.transitionTo('mojsart.main');
  });
}(angular));



