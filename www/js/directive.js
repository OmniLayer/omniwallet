//global directives go here

angular.module('omniwallet').directive('omSelect', function() {
   return {  
      template: '<div class="form-inline"> \
        {{text}}    \
        <select class="form-control">  \
          <option ng-repeat="option in options"> {{option}} </option>   \
        </select>   \
      </div> ',
      scope: { 
        localOptions: '@options'
      },
      link: function link(scope, iElement, iAttrs) {
        //DEBUG console.log(typeof iAttrs.options, scope)
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
        addons: '@'
      },
      link: function link(scope, iElement, iAttrs) {

        scope.text = iAttrs.text
        
        iElement.find('.input-group').addClass(iAttrs.addclass)
        
        if( iAttrs.value )
          iElement.find('.form-control').attr('value',iAttrs.value)
        else
          iElement.find('.form-control').attr('placeholder',iAttrs.placeholder)

        if( iAttrs.disable ) {
          iElement.find('.form-control').attr('disabled','')
        }

        if( iAttrs.addons ) {
          scope.addons = iAttrs.addons.split(',');

          for( var i = scope.addons.length-1; i >= 0; i--) {
            iElement.find('.form-control')
                .after('<span class="input-group-addon">' + scope.addons[i] + ' </span>');
          }
        }
      }
   }
});
