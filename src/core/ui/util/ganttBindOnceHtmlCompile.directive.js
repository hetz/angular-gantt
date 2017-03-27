(function () {
    'use strict';
    angular.module('gantt').directive('ganttBindOnceCompileHtml', ['$compile', function ($compile) {
        return {
            restrict: 'A',
            require: '^gantt',
            link: function (scope, element, attrs, ganttCtrl) {
                scope.scope = ganttCtrl.gantt.$scope.$parent;
                var value = scope.$eval(attrs.ganttBindOnceCompileHtml);
                element.html(value);
                $compile(element.contents())(scope);
            }
        };
    }]);
}());
