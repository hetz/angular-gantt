(function () {
    'use strict';
    angular.module('gantt').directive('ganttHorizontalScrollReceiver', ['ganttDebounce', function (debounce) {
        // The element with this attribute will scroll at the same time as the scrollSender element

        return {
            restrict: 'A',
            require: '^ganttScrollManager',
            link: function (scope, element, attrs, ganttScrollManagerCtrl) {
                var updateListeners = function (e, delta) {
                    var hasSwap = (e.deltaX < -1 || e.deltaX > 1);
                    if (hasSwap) {
                        var scrollSender = ganttScrollManagerCtrl.getScrollSender();
                        var speed = e.deltaFactor === 1 ? 4 : e.deltaFactor;
                        scrollSender.scrollLeft = scrollSender.scrollLeft - (delta * speed);
                        // $(scrollSender).clearQueue()
                        //     .animate({scrollLeft: scrollSender.scrollLeft - (delta * speed)}, 'fast');
                        e.preventDefault();
                    }
                };
                element.bind('mousewheel', debounce(updateListeners, 5));

                ganttScrollManagerCtrl.registerHorizontalReceiver(element);
            }
        };
    }]);
}());
