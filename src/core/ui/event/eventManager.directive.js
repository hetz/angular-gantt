(function () {
    'use strict';
    angular.module('gantt').directive('ganttEventManager', function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs, controllers) {
                if (angular.isArray(scope.eventDelegate)) {
                    scope.eventDelegate.forEach(function (delegateItem) {
                        element.delegate(delegateItem.target, delegateItem.type, delegateItem.fn);
                    });
                }
            }
        };
    });
}());

