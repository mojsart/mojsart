(function (angular) {

  'use strict';

  angular.module('mojsart')
  // tweet button directive for about page
  .directive('twitter', ['$timeout', function ($timeout) {
    return {
      link: function (scope, element, attr) {
        $timeout(function () {
          twttr.widgets.createShareButton(
            attr.url,
            element[0],
            function () {}, {
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

  // home visualizer directive
  .directive('d3Visualizer', ['d3Service', function (d3Service) {
    return {
      restrict: 'EA',
      scope: {
        data: "=",
        label: "@",
        onClick: "&",
        setData: "="
      },  
      link: function (scope, iElement, iAttrs) {
        // initialize d3
        d3Service.d3().then(function (d3) {
          var svg = d3.select(iElement[0]).append("svg"); // select the parent div
          
          window.onresize = function () {
            return scope.$apply();
          };

          // watch window height and re-render on changes
          scope.$watch(function () {
            return angular.element(window)[0].innerHeight;
          }, function () {
            svg.attr("height", function () {
              return angular.element(window)[0].innerHeight - 90; // re-set graph to window height - menubar space
            });
            if(scope.data) {
              return scope.render(scope.data);
            }
          });

          // watch for data changes and re-render on changes
          scope.$watch('data', function (newVals, oldVals) {
            if(newVals){
              return scope.render(newVals);
            }
          }, true);

          // define render function
          scope.render = function (data) {

            // remove all previous items before render
            svg.selectAll("*").remove();

            // setup variables
            var width = d3.select(iElement[0])[0][0].offsetWidth;
            var height = d3.select(iElement[0])[0][0].offsetHeight;

            // sort data so smaller circles appear on top
            if(data && data.length > 1) {
              data = data.sort(function (a, b) {
                if (a.echoData.audio_summary.loudness > b.echoData.audio_summary.loudness) {
                  return -1;
                }
                if (a.echoData.audio_summary.loudness < b.echoData.audio_summary.loudness) {
                  return 1;
                }
                return 0;
              });
            }

            // make circles start as tiny and grow
            var circles = svg.selectAll("circle")
              .data(data)
              .enter()
                .append("circle")
                  .attr("r", 0)
                  .attr("stroke", "black")
                  .attr("stroke-width", 2);

            // make circles bigger and change color on mouseover
            circles.on("mouseover", function () {
              d3.select(this)
                .transition()
                .attr("fill", "#9BDA6A")
                .attr("r", d3.select(this).attr("r")*1.2);
            });

            // on click, set artist/title and run setData
            circles.on("click", function (d, i) {
              var artist = d.echoData.artist;
              var title = d.echoData.title;
              scope.$apply(function () { scope.setData(d); });

              // var x = d3.select(this).attr('cx');
              // var y = d3.select(this).attr('cy');
              // console.log(artist, '-', title, ': (' + x + ', ' + y + ')');
              // console.log('md5:', d.echoData.md5);
            });

            // on mouseout, make circle back to normal size/color
            circles.on("mouseout", function () {
              d3.select(this)
                .transition()
                .attr("fill", function (d) { return (d.cached) ? "#60A859" : "white"; })
                .attr("r", function (d) { return 45*Math.pow(10, (d.echoData.audio_summary.loudness/20)); });
            });

            // grow circles to appropriate size
            circles.transition()
              .delay(function(d, i) { return 80*i; } )
              .duration(1500) // time of duration
              .ease("elastic")
            .attr("r", function (d) { return 45*Math.pow(10, (d.echoData.audio_summary.loudness/20)); })
            .attr("cx",function (d) { return width*(d.echoData.audio_summary.speechiness + d.userData.speechiness + d.echoData.audio_summary.acousticness/3); })
            .attr("cy", function (d) { return height*(d.echoData.audio_summary.energy + d.echoData.audio_summary.danceability)/2; })
            .attr("fill", function (d) { return (d.cached) ? "#60A859" : "white"; });
          };
        });
      }
    };
  }]);
}(angular));