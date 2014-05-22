angular.module('mojsart.main.sidebar', ['ui.router'])

.config(function ($stateProvider) {

  $stateProvider
    .state('mojsart.main.sidebar', {
      url: '/main',
      templateUrl: 'sidebar/sidebar.tpl.html',
      controller: 'SideBar'
    });
})
.controller('SideBar', function ($scope) {
  console.log('inside  sidepanel Controller');
  $scope.questions = ['song','questions','will', 'go', 'here'];
});
console.log("I am running");
