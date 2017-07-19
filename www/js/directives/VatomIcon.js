angular.module("omniDirectives").directive('vatomIcon', function ($compile) {
    return {
        template: '<div></div>',
        scope: {
            model: "=",
            format: "@",
            vatomDef: "@"
        },
        link: function (scope, element) {
            scope.$watch("vatomDef", function () {
                if (scope.vatomDef === "") { return; }
                
                var def = JSON.parse(scope.vatomDef);
                
                const vatom = new Vatomic.Vatom(def);
                const el = new Vatomic.VatomView(vatom, { view_mode: "icon" });
                $compile(element.contents())(scope);
                element.replaceWith(el.element);
            });
        }
    };
});