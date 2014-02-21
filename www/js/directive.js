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
            .text(function(d) { console.log(d); return d.data.name; });
      });
    }
  }
});

angular.module('omniwallet').directive('omSelect', function() {
   return {  
      template: '<div class="form-inline"> \
        {{text}}    \
        <select class="form-control" ng-model="selectedOption" \
          ng-options="option for option in options" \
          ng-change="expr(selectedOption)">  \
          <option value=""> -- choose {{type}} -- </option> \
        </select>   \
      </div> ',
      scope: { 
        localOptions: '@options',
        expr: '='
      },
      link: function link(scope, iElement, iAttrs) {
        //DEBUG         console.log(iAttrs, scope)
        scope.type = iAttrs.type
        scope.text = iAttrs.text

        scope.options = JSON.parse(scope.localOptions)

        iElement.find('.form-inline').addClass(iAttrs.addclass)
      }
   }
});

angular.module('omniwallet').directive('omInput', function() {
   return {  
      template: '<div class="input-group">   \
      <span class="input-group-addon"> {{text}} </span>  \
      <input type="text" class="form-control">  \
      </div>',
      scope: {
        addons: '@',
        data: '='
      },
      compile: function compile(tElement, tAttrs) {
        var scope = {}
        //DEBUG console.log(scope, this.template)
        if( tAttrs.addons ) {
          scope.addons = tAttrs.addons.split(',');

          for( var i = scope.addons.length-1; i >= 0; i--) {
            var templateString = '<span class="input-group-addon">' + scope.addons[i] + ' {{data['+i+']}} </span>'
            tElement.find('.form-control').after(templateString);
          }
        }

       return {
         post: function(scope, iElement, iAttrs) {
            scope.text = iAttrs.text
            
            iElement.find('.input-group').addClass(iAttrs.addclass)
            
            if( iAttrs.value )
              iElement.find('.form-control').attr('value',iAttrs.value)
            else
              iElement.find('.form-control').attr('placeholder',iAttrs.placeholder)

            if( iAttrs.disable ) {
              iElement.find('.form-control').attr('disabled','')
            }
         }
        }
      }
   }
});
