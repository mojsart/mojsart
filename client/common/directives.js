(function (angular) {
  "use strict";

  angular.module('mojsart')
  .directive('search', function () {
    return {

    };
  })
/*  .directive('pieChart', function() {
    // Return our directive description object
    // that will create the directive
    return {
      restrict: 'EA',
      require: 'ngModel',
      scope: {
        'ngModel': '='
      },
      link: function(scope, element, attrs, ctrl) {
        // Define our D3 components
        var svg = d3.select(element[0])
          .append('svg')
          .attr('width', 400)
          .attr('height', 400)
          .append('g')
          .attr('transform', 'translate(200,200)');

        var color = d3.scale.category10(),
            arc = d3.svg.arc().outerRadius(120).innerRadius(90),
            pie = d3.layout.pie();

        var arcs = svg.selectAll('path')
          .data(pie(scope.ngModel))
          .enter().append('path').attr({
            d: arc,
            fill: function(d,i) { return color(i); },
            stroke: 'white'
          });
      }
    };
  });
*/}(angular));