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
        abstract: true,
        template: '<ui-view></ui-view>'
      });
  })
  .run(function ($state) {
    $state.transitionTo('mojsart.main');
  });
}(angular));



