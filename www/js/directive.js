//global directives go here

angular.module('omniwallet').directive('d3PieChart', function() {
  return {
    template: '<svg></svg>',
    controller: function( $scope, $element, $attrs) {

      $scope.chart = {
          width : 300,
          height : 300
      }
      $scope.radius = Math.min($scope.chart.width, $scope.chart.height) / 2
      
      $element.find('svg').attr('height', $scope.chart.height).attr('width', $scope.chart.width);

      var color = d3.scale.category20()

      var arc = d3.svg.arc()
          .outerRadius($scope.radius - 10)
          .innerRadius(0);

      var pie = d3.layout.pie()
          .sort(null)
          .value(function(d) {  return d.value; });

      var svg = d3.select("svg")
      
      $scope.totalsPromise.then(function(successData) {

        var data = [], keys = Object.keys($scope.totals);
        keys.forEach(function(e,i) {
           data.push({ value : $scope.totals[e], name: keys[i], color: Math.floor(Math.random()*10) });
        });

        var g = svg.selectAll(".arc")
            .data(pie(data))
          .enter().append("g")
            .attr("class", "arc");

        g.append("path")
            .attr("d", arc)
            .style("fill", function(d) {  return color(d.data.color); })
            .attr('transform', 'translate(150,150)');

        g.append("text")
            .attr("transform", function(d) { 
                var c = arc.centroid(d);
                    return "translate(" + (150+ c[0]) + "," + (150 + c[1]) + ")";
               })
            .attr("dy", ".35em")
            .style("text-anchor", "middle")
            .text(function(d) { return d.data.name; });
      });
    }
  }
}).directive('omTooltip', function() {
  return {
    template: '<small><strong>(?)<strong></small>',
    link: function(scope, iElement, iAttrs, controller) {
      if( iAttrs.text)
        iElement.tooltip({ title: iAttrs.text, placement: 'down', container: 'body'});
    }
  }
}).directive('match', [function () {
  return {
    require: 'ngModel',
    link: function (scope, elem, attrs, ctrl) {

      scope.$watch('[' + attrs.ngModel + ', ' + attrs.match + ']', function(value){
        ctrl.$setValidity('match', value[0] === value[1] );
      }, true);

    }
  }
}]);
