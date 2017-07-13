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
                console.log(scope.vatomDef);
                
                if (scope.vatomDef === "") { return; }
                
                console.log(scope);
                
                var def = JSON.parse(scope.vatomDef);
                
                console.log("new vatom...");
                
                const vatom = new Vatomic.Vatom(def);
                const el = new Vatomic.VatomView(vatom, { view_mode: "icon" });
                $compile(element.contents())(scope);
                element.replaceWith(el.element);
                
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