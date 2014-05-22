(function() {

angular.module('d3', [])
.provider('FBService', function() {
  var _scriptUrl = '//d3js.org/d3.v3.min.js',
      _scriptId = 'd3-sdk';

  // Create a script tag with moment as the source
  // and call our onScriptLoad callback when it
  // has been loaded
  function createScript(document, callback, success) {
    var scriptTag = document.createElement('script');
    scriptTag.type = 'text/javascript';
    scriptTag.async = true;
    scriptTag.id = _scriptId;
    scriptTag.src = _scriptUrl;
    scriptTag.onreadystatechange = function () {
      if (this.readyState == 'complete') {
        callback();
      }
    };

    // Set the callback to be run
    // after the scriptTag has loaded
    scriptTag.onload = callback;

    // Attach the script tag to the document body
    var s = document.getElementsByTagName('body')[0];
    s.appendChild(scriptTag);
  }

  // Create the D3Service method
  // injecting the `$document`, `$timeout`,
  // `$q`, `$rootScope`, and `$window` services
  this.$get = ['$document', '$timeout', '$q',
    '$rootScope', '$window',
    function($document, $timeout, $q, $rootScope, $window) {
    var deferred = $q.defer();

    // Load client in the browser
    // which will get called after the script
    // tag has been loaded
    function onSuccess() {}
      var onScriptLoad = function(callback) {
      onSuccess();
      $timeout(function() {
        // Resolve the deferred promise
        // as the FB object on the window
        deferred.resolve($window.d3);
      });
    };
    // Kick it off and get using D3
    createScript($document[0], onScriptLoad);
    console.log('d3 loaded!')
    return deferred.promise;
  }];
});

})();