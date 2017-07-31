angular.module("omniDirectives").directive('vatomCard', function ($compile) {
    return {
        template: '<div></div>',
        scope: {
            model: "=",
            format: "@",
            vatomDef: "@"
        },
        link: function (scope, element) {
            var currentElement = element;
            scope.$watch("vatomDef", function () {
                if (scope.vatomDef === "") { return; }

                var def = JSON.parse(scope.vatomDef);

                var vatom = new Vatomic.Vatom(def);
                var el = new Vatomic.VatomView(vatom, { view_mode: "card|fullscreen" });
                currentElement.replaceWith(el.element);
                currentElement = el.element;
                
                window.addEventListener("resize", function (e) {
                    var height = 0;
                    var width = 0;
                    
                    var scaleUsing = window.innerWidth / (window.innerHeight - 94);
                    
                    if (scaleUsing > 0.62) {
                        height = window.innerHeight - 94;
                        width = height * (10 / 16);
                    }
                    else {
                        width = window.innerWidth;
                        height = width * (16 / 10);
                        
                        var ratio = height / window.innerHeight;
                        var toPercent = ratio * 100;
                    }
                    
                    currentElement.parentElement.style.height = (height - 20) + "px";
                    currentElement.parentElement.style.width = (width - 20) + "px";
                }, true);
            });
        }
    };
});