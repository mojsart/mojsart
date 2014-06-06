angular.module('mojsart.main.home', [
  'ui.router',
  'fx.animations',
  'mojsart.main.sidebar',
  'mojsart.main.graph',
  'ngAnimate'
])

.config(function ($stateProvider) {

  $stateProvider
    .state('mojsart.main', {
      url: '/main',
      views: {
        'sidebar': {templateUrl: '/sidebar/sidebar.tpl.html', controller:'SideBarController'},
        'graph':{templateUrl: '/graph/graph.tpl.html', controller:'GraphController'}
      }
    });
})

.controller('ModalDemoCtrl', function ($scope, $modal, $log) {
  $scope.sharedState.onHome = true;
  console.log($scope.sharedState.onHome);
  $scope.items = ['item1', 'item2', 'item3'];
  $scope.open = function () {

    var modalInstance = $modal.open({
      templateUrl: 'home/upload.tpl.html',
      controller: ModalInstanceCtrl,
      resolve: {
        items: function () {
          return $scope.items;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };
});

// Please note that $modalInstance represents a modal window (instance) dependency.
// It is not the same as the $modal service used above.

var ModalInstanceCtrl = function ($scope, $http, $modalInstance, items) {

  $scope.items = items;
  $scope.selected = {
    item: $scope.items[0]
  };
  //recognizes when one or more files are selected, loads them to array
  $scope.filesChanged = function(elm){
      $scope.files = elm.files;
      $scope.$apply();
      console.log($scope.files);
    };

    //Loops over $scope.files object, formats each file as FormData
    $scope.upload = function () {
      console.log($scope.files);
      var fd = new FormData();
      angular.forEach($scope.files, function (file) {
          fd.append('file', file);
      });
    //This is the Post request to add a new song. Note that it sends FormData (fd)
      $http({
          method: 'POST',
          url: '/song/send',
          data: fd,
          headers: {
              'Content-Type': undefined
          },
          transformRequest: angular.identity
      })
          .success(function (data, status, headers, config) {
          console.log("Sent:", data);
          //toggles in order to show hidden button, using ng-show in upload.tpl.html
          $scope.sent = true;
      });
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
};