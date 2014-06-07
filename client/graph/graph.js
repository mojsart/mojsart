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
  $scope.pathToSong = '/song/get/md5/';

  // this function extends $scope.sharedState with the song data from a clicked node. 
  // See graph.tpl.html for use.
  $scope.populateNodeData = function (d) {
    $scope.sharedState.songPath = $scope.pathToSong + d.echoData.md5;

    // TODO: find some nice way to deep-copy the song in question
    for(var property in d.echoData) {
      $scope.sharedState[property] = d.echoData[property];
    }
    for(property in d.echoData.audio_summary) {
      $scope.sharedState.audio_summary[property] = d.echoData.audio_summary[property];
    }

    // The click event on a graph node sets the "comparing" propoerty on sharedState to true.
    // This removes the new-user tutorial
    $scope.sharedState.comparing = true;

    // Clicking a graph node when there is less than one sidebar vote visible refreshes the sidebar.
    if($scope.sharedState.songs.length <= 1) {
      $scope.getSongs($scope.fillSongsList);
    }
  };
});