(function () {
    'use strict';
    angular.module('gantt')
        .directive('ganttBackgroundStyle', ['ganttDebounce', function (debounce) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    var setNewBackgroundStyle = function (newStyles) {
                        //debounce(function (newStyles) {
                        // console.count('setNewBackgroundStyle');
                        if (newStyles != null) {
                            element.css('backgroundColor', newStyles);
                        }
                        // }, 50);
                    };

                    scope.$watch(attrs.ganttBackgroundStyle, function ngStyleWatchAction(newStyles, oldStyles) {
                        // if (oldStyles && (newStyles !== oldStyles)) {
                        //     resetOldStyle(oldStyles);
                        // }
                        setNewBackgroundStyle(newStyles);
                    });
                }
            };
        }])
        .directive('ganttStyle', ['ganttDebounce', function (debounce) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    var resetOldStyle = function (oldStyles) {
                        // console.count('resetOldStyle:' + _.keys(oldStyles));
                        angular.forEach(oldStyles, function (val, style) {
                            element.css(style, '');
                        });
                    };

                    var setNewStyle = function (newStyles) {
                        //debounce(function (newStyles) {
                        // console.count(element.attr('class'))
                        // console.count('    ' + _.keys(newStyles));
                        // console.count('    ' + _.values(newStyles));
                        element.css(newStyles);
                        // }, 50);
                    };

                    scope.$watch(attrs.ganttStyle, function ngStyleWatchAction(newStyles, oldStyles) {
                        if (oldStyles && (newStyles !== oldStyles)) {
                            resetOldStyle(oldStyles);
                        }
                        if (newStyles && Object.keys(newStyles).length !== 0) {
                            setNewStyle(newStyles);
                        }
                    }, true);
                }
            };
        }]);
}());
