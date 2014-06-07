(function (angular) {

  'use strict';

  angular.module('mojsart', [
    'fx.animations',
    'ngAnimate',
    'ui.router',
    'd3',
    'mojsart.main'
    ])

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
    $state.transitionTo('mojsart.about');
  });
}(angular));



