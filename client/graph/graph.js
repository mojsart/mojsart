angular.module('mojsart.main.graph', ['ui.router'])

.config(function ($stateProvider) {

  $stateProvider
  .state('mojsart.main.graph', {
    url: '/main',
    templateUrl: 'graph/graph.tpl.html',
    controller: 'GraphController'
  });
})

.controller('GraphController', function ($scope) {
  // this function does not do what it says as of now. for now all it does is update
  // the parent scope's sharedState object, which the sidebar uses to update the
  // song that is playing. this function is fired when the user clicks on any given
  // node in the d3 visualization (see: directives.js and graph.tpl.html)
  $scope.postFeedback = function (d) {
    // TODO: find some nice way to deepcopy the song in question
    $scope.sharedState.songPath = '/song/get/md5/' + d.echoData.md5;
    for(var property in d.echoData) {
      $scope.sharedState[property] = d.echoData[property];
    }
    for(property in d.echoData.audio_summary) {
      $scope.sharedState.audio_summary[property] = d.echoData.audio_summary[property];
    }
  };
});