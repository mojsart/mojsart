(function (angular) {
  "use strict";

  angular.module('mojsart')
  .directive('search', function () {
    return {

    };
  })

  .directive('twitter',['$timeout',function($timeout) {
    return {
      link: function(scope, element, attr) {
        $timeout(function() {
          twttr.widgets.createShareButton(
            attr.url,
            element[0],
            function() {}, {
              count: attr.count,
              text: attr.text,
              via: attr.via,
              size: attr.size
            }
          );
        });
      }
    };
  }])

  // use this directive as a template for other directives
  .directive('d3Visualizer', ['d3Service', function(d3Service) {
    return {
      restrict: 'EA',
      scope: {
        data: "=",
        label: "@",
        onClick: "&",
        onClickThingy: "="
      },
      
      link: function(scope, iElement, iAttrs) {
        d3Service.d3().then(function(d3) {
          var svg = d3.select(iElement[0])
          .append("svg")
          .attr("height", "85%"); //TODO do not hardcode

          // on window resize, re-render d3 canvas
          window.onresize = function() {
            return scope.$apply();
          };

          scope.$watch(function(){
              return angular.element(window)[0].innerWidth;
            }, function(){
              return scope.render(scope.data);
            }
          );

          // watch for data changes and re-render
          scope.$watch('data', function(newVals, oldVals) {
            return scope.render(newVals);
          }, true);

          // define render function
          scope.render = function(data){
            // remove all previous items before render
            svg.selectAll("*").remove();

            // setup variables
            var width, height, max;
            width = d3.select(iElement[0])[0][0].offsetWidth;
            height = d3.select(iElement[0])[0][0].offsetHeight;

            // sort data so smaller circles appear on top
            data = data.sort(function (a, b) {
              if (a.echoData.audio_summary.loudness > b.echoData.audio_summary.loudness)
                return 1;
              if (a.echoData.audio_summary.loudness < b.echoData.audio_summary.loudness)
                return -1;
              // a must be equal to b
              return 0;
            });

            var circles = svg.selectAll("circle")
              .data(data)
              .enter()
                .append("circle")
                  .attr("fill", "white")
                  .attr("stroke", "black")
                  .attr("stroke-width", 3)
                .on("click", function(d, i) {
                  var artist = d.echoData.artist;
                  var title = d.echoData.title;
                  var x = d3.select(this).attr('cx');
                  var y = d3.select(this).attr('cy');
                  // console.log(scope.onClickThingy)
                  scope.$apply(function() {scope.onClickThingy(d);});
                  // can't just do scope.onClickThingy because angular needs to know about it
                  // digest cycle
                  console.log(artist, '-', title, ': (' + x + ', ' + y + ')');
                  console.log('md5:', d.echoData.md5);
                })
                .on("mouseover", function() {
                  d3.select(this)
                    .transition()
                    .attr("fill", "lightblue")
                    // .attr("stroke", "lightblue")
                    .attr("r", d3.select(this).attr("r")*1.2);
                    
                })
                .on("mouseout", function() {
                  d3.select(this)
                    .transition()
                    .attr("fill", "white")
                    .attr("stroke", "black")
                    .attr("r", d3.select(this).attr("r")/1.2);
                })
                     // .attr("fill",function(d,i){return color(i);})
                     // .attr("stroke",function(d,i){return color(i);})
                .attr("r", 0) // radius
                // .attr("cx",function() { return width*Math.random(); })
                // .attr("cy", function() { return height*Math.random(); })
                .transition()
                  .duration(1000) // time of duration
                .attr("r", function(d) { return Math.abs(5 * d.echoData.audio_summary.loudness); })
                .attr("cx",function(d) { return width*(d.echoData.audio_summary.speechiness + d.userData.speechiness + d.echoData.audio_summary.acousticness/3); })
                .attr("cy", function(d) { return height*(d.echoData.audio_summary.energy + d.echoData.audio_summary.danceability)/2; });
          };
        });
      }
    };
  }]);
}(angular));