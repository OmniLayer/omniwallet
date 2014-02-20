//global directives go here

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
