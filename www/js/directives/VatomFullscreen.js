angular.module("omniDirectives").directive('vatomFullscreen', function ($compile) {
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
                var el = new Vatomic.VatomView(vatom, { view_mode: "icon" });
                currentElement.replaceWith(el.element);
                currentElement = el.element;
            });
        }
    };
});