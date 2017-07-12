(function () {
    'use strict';
    angular.module('gantt')
        .directive('ganttBackgroundStyle', ['ganttDebounce', function (debounce) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    var setNewBackgroundStyle = debounce(function (newStyles) {
                        // console.count('setNewBackgroundStyle');
                        element.css('backgroundColor',newStyles);
                    }, 150);

                    scope.$watch(attrs.ganttBackgroundStyle, function ngStyleWatchAction(newStyles, oldStyles) {
                        // if (oldStyles && (newStyles !== oldStyles)) {
                        //     resetOldStyle(oldStyles);
                        // }
                        if (newStyles != null) {
                            setNewBackgroundStyle(newStyles);
                        }
                    });
                }
            };
        }])
        .directive('ganttStyle', ['ganttDebounce', function (debounce) {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {
                    // var resetOldStyle = debounce(function (oldStyles) {
                    //     console.count('resetOldStyle');
                    //     angular.forEach(oldStyles, function (val, style) {
                    //         element.css(style, '');
                    //     });
                    // }, 200);

                    var setNewStyle = debounce(function (newStyles) {
                        // console.count(element.attr('class'))
                        // console.count('    ' + _.keys(newStyles));
                        // console.count('    ' + _.values(newStyles));
                        element.css(newStyles);
                    }, 150);

                    scope.$watch(attrs.ganttStyle, function ngStyleWatchAction(newStyles, oldStyles) {
                        // if (oldStyles && (newStyles !== oldStyles)) {
                        //     resetOldStyle(oldStyles);
                        // }
                        if (newStyles && Object.keys(newStyles).length !== 0) {
                            setNewStyle(newStyles);
                        }
                    }, true);
                }
            };
        }]);
}());
