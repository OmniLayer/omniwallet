//global directives go here

angular.module('omniwallet').directive('omTooltip', function() {
    return {
      template: '<small><strong>(?)<strong></small>',
      link: function(scope, iElement, iAttrs, controller) {
        if (iAttrs.text)
          iElement.tooltip({
            title: iAttrs.text,
            placement: 'down',
            container: 'body'
          });
      }
    };
  }).directive('match', [function() {
    return {
      require: 'ngModel',
      link: function(scope, elem, attrs, ctrl) {

        scope.$watch('[' + attrs.ngModel + ', ' + attrs.match + ']', function(value) {
          ctrl.$setValidity('match', value[0] === value[1]);
        }, true);

      }
    };
 }]).directive('autoFocus', function($timeout) {
  return {
    restrict: 'AC',
    scope: {
      'autoFocus': '=autoFocus'
    },
    link: function(scope, element) {
      scope.$watch('autoFocus', function() {
        if(scope.autoFocus) {
          $timeout(function(){
            $(element[0]).focus();
          }, 100);
        }
      });
    }
  };
}).directive('ensureInteger', function() {
  return {
    restrict: 'A',
    scope:{
      ensureIf:'&',
      ensureOver:'='
    },
    link: function(scope, ele, attrs) {
      scope.$watch("ensureOver", function(value) {
        if(scope.ensureIf())
          if (!(typeof value==='number' && (value%1)===0)){
            if (typeof value == "object")
              scope.ensureOver = value.round();
            else
              scope.ensureOver = Math.ceil(value);
          }
            
      });
      scope.$watch("ensureIf", function(value) {
        if(scope.ensureIf())
          if (!(typeof value==='number' && (value%1)===0))
            if (typeof value == "object")
              scope.ensureOver = value.round();
            else
              scope.ensureOver = Math.ceil(value);
      });
    }
  };
}).directive('bigNumber', function() {
  return {
    restrict: 'A',
    require:'?ngModel',
    link: function(scope, ele, attr, ctrl) {           
                  
      // add a parser that will process each time the value is 
      // parsed into the model when the user updates it.
      ctrl.$parsers.unshift(function(value) {
          // test and set the validity after update.
          var number=undefined;
          try{
            number= new Big(value);
            ctrl.$setValidity('validBigInt', true);
          } catch(e) {
            ctrl.$setValidity('validBigInt', false);
          };
          if(number != undefined){
            var min = number.gte(new Big(attr.min));
            ctrl.$setValidity('minValue', min);
            
            var max = number.lte(new Big(attr.max));
            ctrl.$setValidity('maxValue', max);
            
            if(!max || !min)
              number=undefined;
          }
          // if it's valid, return the value to the model, 
          // otherwise return undefined.
          return number;
      });
      
      // add a formatter that will process each time the value 
      // is updated on the DOM element.
      ctrl.$formatters.unshift(function(value) {
          // validate.
          var number=undefined;
          try{
            number= new Big(value);
            ctrl.$setValidity('validBigInt', true);
          } catch(e) {
            ctrl.$setValidity('validBigInt', false);
          };
          if(number != undefined){
            var min = number.gte(new Big(attr.min));
            ctrl.$setValidity('minValue', min);
            
            var max = number.lte(new Big(attr.max));
            ctrl.$setValidity('maxValue', max);
            
            if(!max || !min)
              number=undefined;
          }
          
          // return the value or nothing will be written to the DOM.
          return number || value;
      });
    }
  };
}).directive("fileread", [function () {
    return {
        scope: {
            fileread: "="
        },
        link: function (scope, element, attributes) {
            element.bind("change", function (changeEvent) {
                var reader = new FileReader();
                reader.onload = function (loadEvent) {
                    scope.$apply(function () {
                        scope.fileread = loadEvent.target.result;
                    });
                };
                reader.readAsText(changeEvent.target.files[0]);
            });
        }
    };
}]);
