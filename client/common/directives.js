(function (angular) {
  "use strict";

  angular.module('mojsart')
  .directive('search', function () {
    return {

    };
  })

  // use this directive as a template for other directives
  .directive('d3Visualizer', ['d3Service', function(d3) {
    return {
      restrict: 'EA',
      scope: {
        data: "=",
        label: "@",
        onClick: "&"
      },
      link: function(scope, iElement, iAttrs) {
        d3.d3().then(function(d3) {
          var svg = d3.select(iElement[0])
              .append("svg")
              .attr("width", "100%")
              .attr("height", "100%"); //TODO do not hardcode

        //   // on window resize, re-render d3 canvas
        //   window.onresize = function() {
        //     return scope.$apply();
        //   };
        //   scope.$watch(function(){
        //       return angular.element(window)[0].innerWidth;
        //     }, function(){
        //       return scope.render(scope.data);
        //     }
        //   );

        //   // watch for data changes and re-render
          scope.$watch('data', function(newVals, oldVals) {
            return scope.render(newVals);
          }, true);

        //   // define render function
          scope.render = function(data){
            // remove all previous items before render
            svg.selectAll("*").remove();

        //     // setup variables
            var width, height, max;
            width = d3.select(iElement[0])[0][0].offsetWidth - 20;
        //       // 20 is for margins and can be changed
            height = d3.select(iElement[0])[0][0].offsetHeight - 20;
        //       // 35 = 30(bar height) + 5(margin between bars)
        //     // max = 98;
        //       // this can also be found dynamically when the data is not static
        //       // max = Math.max.apply(Math, _.map(data, ((val)-> val.count)))

        //     // set the height based on the calculations above
            // svg.attr('height', height);

        //     //create the rectangles for the bar chart
            svg.selectAll("circle")
              .data(data)
              .enter()
                .append("circle")
                .on("click", function(d, i){return scope.onClick({item: d});})
                .attr("r", 0) // height of each bar
                .attr("cx",function() { return width*Math.random(); })
                .attr("cy", function() { return height*Math.random(); })
                .transition()
                  .duration(1000) // time of duration
                .attr("r", 20)
                .attr("cx",function(d) { return width*(d.speechiness + d.acousticness/2); })
                .attr("cy", function(d) { return height*(d.energy + d.danceability)/2; });
          };
        });
      }
    };
  }]);
}(angular));