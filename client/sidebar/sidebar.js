angular.module('mojsart.main.sidebar', ['ui.router'])

.config(function ($stateProvider) {

  $stateProvider
    .state('mojsart.main.sidebar', {
      url: '/main',
      templateUrl: 'sidebar/sidebar.tpl.html',
      controller: 'SideBarController'
    });
})
.controller('SideBarController', function ($scope) {
  console.log('inside  sidepanel Controller');
  $scope.buttonStatus =  'full';
  $scope.songs = ['Let it be','Run Like an Antelope','Killer Queen'];
});


