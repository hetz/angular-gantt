(function () {
    'use strict';
    angular.module('gantt').directive('ganttVerticalScrollReceiver', ['ganttDebounce', function (debounce) {
        // The element with this attribute will scroll at the same time as the scrollSender element

        return {
            restrict: 'A',
            require: '^ganttScrollManager',
            link: function (scope, element, attrs, ganttScrollManagerCtrl) {
                var updateListeners = function (e, delta) {
                    var scrollSender = ganttScrollManagerCtrl.getScrollSender();
                    var speed = e.deltaFactor === 1 ? 3 : e.deltaFactor;
                    $(scrollSender).clearQueue()
                        .animate({scrollTop: scrollSender.scrollTop - (delta * speed)}, 'fast');
                    e.preventDefault();
                };
                element.bind('mousewheel', debounce(updateListeners, 5));

                ganttScrollManagerCtrl.registerVerticalReceiver(element);
            }
        };
    }]);
}());

