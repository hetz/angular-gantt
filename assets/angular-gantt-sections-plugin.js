/*
Project: angular-gantt v1.3.0 - Gantt chart component for AngularJS
Authors: Marco Schweighauser, Rémi Alvergnat
License: MIT
Homepage: https://www.angular-gantt.com
Github: https://github.com/angular-gantt/angular-gantt.git
*/
(function(){
    'use strict';
    angular.module('gantt.sections', ['gantt', 'gantt.sections.templates']).directive('ganttSections', ['moment', '$compile', '$document', function(moment, $compile, $document) {
        return {
            restrict: 'E',
            require: '^gantt',
            scope: {
                enabled: '=?'
            },
            link: function(scope, element, attrs, ganttCtrl) {
                var api = ganttCtrl.gantt.api;

                // Load options from global options attribute.
                if (scope.options && typeof(scope.options.sections) === 'object') {
                    for (var option in scope.options.sections) {
                        scope[option] = scope.options.sections[option];
                    }
                }

                if (scope.enabled === undefined) {
                    scope.enabled = true;
                }

                api.directives.on.new(scope, function(directiveName, taskScope, taskElement) {
                    if (directiveName === 'ganttTaskForeground') {
                        var sectionsScope = taskScope.$new();
                        sectionsScope.pluginScope = scope;
                        sectionsScope.task = taskScope.task;

                        var ifElement = $document[0].createElement('div');
                        angular.element(ifElement).attr('data-ng-if', 'task.model.sections !== undefined && pluginScope.enabled');
                        angular.element(ifElement).attr('class', 'gantt-task-foreground-sections');

                        var sectionsElement = $document[0].createElement('gantt-task-sections');

                        if (attrs.templateUrl !== undefined) {
                            angular.element(sectionsElement).attr('data-template-url', attrs.templateUrl);
                        }
                        if (attrs.template !== undefined) {
                            angular.element(sectionsElement).attr('data-template', attrs.template);
                        }
                        angular.element(ifElement).append(sectionsElement);
                        taskElement.append($compile(ifElement)(sectionsScope));
                    }
                });
            }
        };
    }]);
}());


(function(){
    'use strict';
    angular.module('gantt.sections').directive('ganttTaskSections', ['$templateCache', function($templateCache) {
        return {
            restrict: 'E',
            requires: '^ganttTask',
            templateUrl: function(tElement, tAttrs) {
                var templateUrl;
                if (tAttrs.templateUrl === undefined) {
                    templateUrl = 'plugins/sections/taskSections.tmpl.html';
                } else {
                    templateUrl = tAttrs.templateUrl;
                }
                if (tAttrs.template !== undefined) {
                    $templateCache.put(templateUrl, tAttrs.template);
                }
                return templateUrl;
            },
            replace: true,
            scope: true,
            controller: ['$scope', '$element', function($scope, $element) {
                $scope.getClasses = function(section) {
                    var classes = [];

                    if (section.classes) {
                        classes = section.classes;
                    }

                    return classes;
                };

                $scope.getCss = function(section) {
                    var css = {};

                    if (section.color) {
                        css['background-color'] = section.color;
                    }

                    return css;
                };

                $scope.task.rowsManager.gantt.api.directives.raise.new('ganttTaskSections', $scope, $element);
                $scope.$on('$destroy', function() {
                    $scope.task.rowsManager.gantt.api.directives.raise.destroy('ganttTaskSections', $scope, $element);
                });
            }]
        };
    }]).directive('ganttTaskSection', [function() {
        return {
            restrict: 'A',
            requires: '^ganttTaskSections',
            scope: true,
            controller: ['$scope', '$element', function($scope, $element) {
                $element.on('mousedown', function() {
                    console.log('section clicked');
                });
            }]
        };
    }]);
}());


angular.module('gantt.sections.templates', []).run(['$templateCache', function ($templateCache) {
    $templateCache.put('plugins/sections/taskSections.tmpl.html',
        '<div ng-cloak class="gantt-task-sections">\n' +
        '    <div ng-repeat="section in task.model.sections"\n' +
        '         ng-style="getCss(section)"\n' +
        '         ng-class="getClasses(section)"\n' +
        '         class="gantt-task-section"\n' +
        '         gantt-task-section></div>\n' +
        '</div>\n' +
        '');
}]);

//# sourceMappingURL=angular-gantt-sections-plugin.js.map