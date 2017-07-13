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

                // Vatomic.RequestHelper.getVatom(scope.vatomId, data => {
                //     const vatom = new Vatomic.Vatom(data);
                //     const el = new Vatomic.VatomView(vatom, { view_mode: "icon" });
                //     $compile(element.contents())(scope);
                //     element.replaceWith(el.element);
                // }, (errorCode, errorText) => {
                //     console.error("could not get vatom", errorCode, errorText);
                // });
            });
        }
    };
});