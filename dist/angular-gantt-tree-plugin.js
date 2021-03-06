/*
Project: angular-gantt v1.3.1 - Gantt chart component for AngularJS
Authors: Marco Schweighauser, Rémi Alvergnat
License: MIT
Homepage: https://www.angular-gantt.com
Github: https://github.com/angular-gantt/angular-gantt.git
*/
(function(){
    'use strict';
    angular.module('gantt.tree', ['gantt', 'gantt.tree.templates', 'ui.tree']).directive('ganttTree', ['ganttUtils', '$compile', '$document', function(utils, $compile, $document) {
        // Provides the row sort functionality to any Gantt row
        // Uses the sortableState to share the current row

        return {
            restrict: 'E',
            require: '^gantt',
            scope: {
                enabled: '=?',
                header: '=?',
                content: '=?',
                headerContent: '=?',
                keepAncestorOnFilterRow: '=?',
                preCollapsedRootRows: '=?'
            },
            link: function(scope, element, attrs, ganttCtrl) {
                var api = ganttCtrl.gantt.api;

                // Load options from global options attribute.
                if (scope.options && typeof(scope.options.tree) === 'object') {
                    for (var option in scope.options.tree) {
                        scope[option] = scope.options.tree[option];
                    }
                }

                if (scope.enabled === undefined) {
                    scope.enabled = true;
                }

                if (scope.header === undefined) {
                    scope.header = 'Name';
                }

                if (scope.headerContent === undefined) {
                    scope.headerContent = '{{getHeader()}}';
                }

                if (scope.keepAncestorOnFilterRow === undefined) {
                    scope.keepAncestorOnFilterRow = false;
                }

                if (scope.preCollapsedRootRows === undefined) {
                    scope.preCollapsedRootRows = [];
                }

                api.directives.on.new(scope, function(directiveName, sideContentScope, sideContentElement) {
                    if (directiveName === 'ganttSideContent') {
                        var labelsScope = sideContentScope.$new();
                        labelsScope.pluginScope = scope;

                        var ifElement = $document[0].createElement('div');
                        angular.element(ifElement).attr('data-ng-if', 'pluginScope.enabled');
                        angular.element(ifElement).addClass('side-element');

                        var labelsElement = $document[0].createElement('gantt-side-content-tree');
                        angular.element(ifElement).append(labelsElement);

                        sideContentElement.append($compile(ifElement)(labelsScope));
                    }
                });
            }
        };
    }]);
}());


(function(){
    'use strict';
    angular.module('gantt.tree').directive('ganttRowTreeLabel', ['GanttDirectiveBuilder', function(Builder) {
        var builder = new Builder('ganttRowTreeLabel');
        builder.restrict = 'A';
        builder.templateUrl = undefined;
        return builder.build();
    }]);
}());


(function(){
    'use strict';
    angular.module('gantt.tree').directive('ganttSideContentTree', ['GanttDirectiveBuilder', function(Builder) {
        var builder = new Builder('ganttSideContentTree', 'plugins/tree/sideContentTree.tmpl.html');
        return builder.build();
    }]);
}());


(function() {
    'use strict';
    angular.module('gantt.tree').controller('GanttTreeController', ['$scope', '$filter', 'GanttHierarchy', 'ganttArrays', function($scope, $filter, Hierarchy, arrays) {
        $scope.rootRows = [];

        $scope.getHeader = function() {
            return $scope.pluginScope.header;
        };

        $scope.toCollapse = function(row) {
            return arrays.isInArray($scope.pluginScope.preCollapsedRootRows, row.model.name);
        };

        var hierarchy = new Hierarchy();

        $scope.pluginScope.$watchGroup(['keepAncestorOnFilterRow', 'enabled'], function(value) {
            var keepAncestor = value[0] && value[1];

            if (keepAncestor) {
                var filterImpl = function(sortedRows, filterRow, filterRowComparator) {
                    hierarchy.refresh(sortedRows);

                    var leaves = [];
                    for (var i = 0; i < sortedRows.length; i++) {
                        // var children = hierarchy.children(sortedRows[i]);
                        // if (!children || children.length === 0) {
                        //     debugger;
                            leaves.push(sortedRows[i]);
                        // }else{
                        //     debugger;
                        // }
                    }

                    var filteredLeaves = $filter('filter')(leaves, filterRow, filterRowComparator);

                    var filterRowKeepAncestor = function(row) {
                        if (filteredLeaves.indexOf(row) > -1) {
                            return true;
                        }

                        var descendants = hierarchy.descendants(row);

                        for (var i = 0; i < descendants.length; i++) {
                            if (filteredLeaves.indexOf(descendants[i]) > -1) {
                                return true;
                            }
                        }

                        return false;
                    };

                    return $filter('filter')(sortedRows, filterRowKeepAncestor, filterRowComparator);
                };
                $scope.gantt.rowsManager.setFilterImpl(filterImpl);
            } else {
                $scope.gantt.rowsManager.setFilterImpl(false);
            }
        });

        var isVisible = function(row) {
            var parentRow = $scope.parent(row);
            while (parentRow !== undefined) {
                if (parentRow !== undefined && parentRow._collapsed) {
                    return false;
                }
                parentRow = $scope.parent(parentRow);
            }
            return true;
        };

        var filterRowsFunction = function(rows) {
            return rows.filter(function(row) {
                return isVisible(row);
            });
        };

        var sortRowsFunction = function(rows) {
            var sortedRows = [];
            var rootRows = [];

            var hasParent = false;

            for (var i=0; i<rows.length; i++) {
                var rowParent = $scope.parent(rows[i]);
                if (rowParent === undefined) {
                    rootRows.push(rows[i]);
                } else {
                    hasParent = true;
                }
            }

            var handleChildren = function(row) {
                sortedRows.push(row);
                var children = $scope.children(row);


                if (children !== undefined && children.length > 0) {
                    var sortedChildren = children.sort(function(a, b) {
                        return rows.indexOf(a) - rows.indexOf(b);
                    });

                    for (var i=0;i<sortedChildren.length;i++) {
                        handleChildren(sortedChildren[i]);
                    }
                }
            };

            for (i=0; i<rootRows.length; i++) {
                handleChildren(rootRows[i]);
            }

            return sortedRows;
        };
        $scope.gantt.api.rows.addRowSorter(sortRowsFunction);
        $scope.gantt.api.rows.addRowFilter(filterRowsFunction);

        $scope.$on('$destroy', function() {
            $scope.gantt.api.rows.removeRowSorter(sortRowsFunction);
            $scope.gantt.api.rows.removeRowFilter(filterRowsFunction);
        });

        var refresh = function() {
            $scope.rootRows = hierarchy.refresh($scope.gantt.rowsManager.filteredRows);

            if ($scope.gantt.rowsManager.filteredRows.length > 0) {
                $scope.gantt.api.rows.sort();
                $scope.gantt.api.rows.refresh();
            }
        };

        $scope.gantt.api.rows.on.remove($scope, refresh);
        $scope.gantt.api.rows.on.add($scope, refresh);

        var isRowCollapsed = function(rowId) {
            var row;
            if (typeof rowId === 'string') {
                row = $scope.gantt.rowsManager.rowsMap[rowId];
            } else {
                row = rowId;
            }
            if (row === undefined) {
                return undefined;
            }
            if (row._collapsed === undefined) {
                return false;
            }
            return row._collapsed;
        };

        var expandRow = function(rowId) {
            var row;
            if (typeof rowId === 'string') {
                row = $scope.gantt.rowsManager.rowsMap[rowId];
            } else {
                row = rowId;
            }
            if (row === undefined) {
                return;
            }

            var rowScope = $scope.nodeScopes[row.model.id];
            if (rowScope && rowScope.collapsed) {
                rowScope.toggle();
            }
        };

        var collapseRow = function(rowId) {
            var row;
            if (typeof rowId === 'string') {
                row = $scope.gantt.rowsManager.rowsMap[rowId];
            } else {
                row = rowId;
            }
            if (row === undefined) {
                return;
            }

            var rowScope = $scope.nodeScopes[row.model.id];
            if (rowScope && !rowScope.collapsed) {
                rowScope.toggle();
            }
        };

        var getHierarchy = function() {
            return hierarchy;
        };

        $scope.getHeaderContent = function() {
            return $scope.pluginScope.headerContent;
        };

        $scope.gantt.api.registerMethod('tree', 'refresh', refresh, this);
        $scope.gantt.api.registerMethod('tree', 'isCollapsed', isRowCollapsed, this);
        $scope.gantt.api.registerMethod('tree', 'expand', expandRow, this);
        $scope.gantt.api.registerMethod('tree', 'collapse', collapseRow, this);

        $scope.gantt.api.registerEvent('tree', 'collapsed');

        $scope.gantt.api.registerMethod('tree', 'getHierarchy', getHierarchy, this);

        $scope.$watchCollection('gantt.rowsManager.filteredRows', function() {
            refresh();
        });

        $scope.children = function(row) {
            if (row === undefined) {
                return $scope.rootRows;
            }
            return hierarchy.children(row);
        };

        $scope.parent = function(row) {
            return hierarchy.parent(row);
        };

        $scope.nodeScopes = {};
    }]).controller('GanttUiTreeController', ['$scope', function($scope) {
        var collapseAll = function() {
            $scope.$broadcast('angular-ui-tree:collapse-all');
        };

        var expandAll = function() {
            $scope.$broadcast('angular-ui-tree:expand-all');
        };

        $scope.gantt.api.registerMethod('tree', 'collapseAll', collapseAll, $scope);
        $scope.gantt.api.registerMethod('tree', 'expandAll', expandAll, $scope);
    }]).controller('GanttTreeNodeController', ['$scope', function($scope) {
        $scope.$parent.nodeScopes[$scope.row.model.id] = $scope;
        $scope.$on('$destroy', function() {
            delete $scope.$parent.nodeScopes[$scope.row.model.id];
        });

        $scope.$watch('children(row)', function(newValue) {
            if (newValue) {
                // Children rows may have been filtered out
                // So we need to filter the raw hierarchy before displaying children in tree.
                var visibleRows = $scope.row.rowsManager.filteredRows;

                var filteredChildrenRows = [];
                for (var i = 0; i < newValue.length; i++) {
                    var childRow = newValue[i];
                    if (visibleRows.indexOf(childRow) > -1) {
                        filteredChildrenRows.push(childRow);
                    }
                }

                $scope.$parent.childrenRows = filteredChildrenRows;
            } else {
                $scope.$parent.childrenRows = newValue;
            }
        });

        $scope.isCollapseDisabled = function() {
            return !$scope.$parent.childrenRows || $scope.$parent.childrenRows.length === 0;
        };

        $scope.getValue = function() {
            return $scope.row.model.name;
        };

        $scope.getRowContent = function() {
            if ($scope.row.model.content !== undefined) {
                return $scope.row.model.content;
            }
            if ($scope.pluginScope.content !== undefined) {
                return $scope.pluginScope.content;
            }

            var content = $scope.row.rowsManager.gantt.options.value('rowContent');
            if (content === undefined) {
                content = '{{row.model.name}}';
            }
            return content;
        };

        $scope.$watch('collapsed', function(newValue) {
            if ($scope.$modelValue._collapsed !== newValue) {
                var oldValue = $scope.$modelValue._collapsed;
                $scope.$modelValue._collapsed = newValue; // $modelValue contains the Row object
                if (oldValue !== undefined && newValue !== oldValue) {
                    $scope.gantt.api.tree.raise.collapsed($scope, $scope.$modelValue, newValue);
                    $scope.gantt.api.rows.refresh();
                }
            }
        });
    }]);
}());


(function(){
    'use strict';
    angular.module('gantt.tree').directive('ganttTreeBody', ['GanttDirectiveBuilder', 'ganttLayout', function(Builder, layout) {
        var builder = new Builder('ganttTreeBody', 'plugins/tree/treeBody.tmpl.html');
        builder.controller = function($scope) {
            // var hScrollBarHeight = layout.getScrollBarHeight();

            $scope.getLabelsCss = function() {
                var css = {};

                if ($scope.maxHeight) {
                    // var bodyScrollBarHeight = $scope.gantt.scroll.isHScrollbarVisible() ? hScrollBarHeight : 0;
                    css['max-height'] = $scope.maxHeight - $scope.gantt.header.getHeight() + 'px';
                    // css['max-height'] = $scope.maxHeight - bodyScrollBarHeight - $scope.gantt.header.getHeight() + 'px';
                }

                return css;
            };
        };
        return builder.build();
    }]);
}());



(function(){
    'use strict';
    angular.module('gantt.tree').directive('ganttTreeHeader', ['GanttDirectiveBuilder', function(Builder) {
        var builder = new Builder('ganttTreeHeader', 'plugins/tree/treeHeader.tmpl.html');
        return builder.build();
    }]);
}());


angular.module('gantt.tree.templates', []).run(['$templateCache', function ($templateCache) {
    $templateCache.put('plugins/tree/sideContentTree.tmpl.html',
        '<div class="gantt-side-content-tree" ng-controller="GanttTreeController"><gantt-tree-header></gantt-tree-header><gantt-tree-body></gantt-tree-body></div>');
    $templateCache.put('plugins/tree/treeBody.tmpl.html',
        '<div class="gantt-tree-body" gantt-style="getLabelsCss()"><div class="gantt-scrollable--receiver-vertical" gantt-vertical-scroll-receiver><div class="gantt-row-label-background"><div class="gantt-row-label gantt-row-height {{::row.model.classes}}" ng-repeat="row in gantt.rowsManager.visibleRows track by row.model.id">&nbsp;</div></div><div ui-tree ng-controller="GanttUiTreeController" data-drag-enabled="false" data-empty-place-holder-enabled="false"><ol class="gantt-tree-root" ui-tree-nodes ng-model="rootRows"><li ng-repeat="row in rootRows track by row.model.id" ui-tree-node data-collapsed="toCollapse(row)" ng-include="\'plugins/tree/treeBodyChildren.tmpl.html\'"></li></ol></div></div></div>');
    $templateCache.put('plugins/tree/treeBodyChildren.tmpl.html',
        '<div ng-controller="GanttTreeNodeController" class="gantt-row-label gantt-row-height {{::row.model.classes}}"><a ng-if="childrenRows!=null" ng-disabled="isCollapseDisabled()" data-nodrag class="gantt-tree-handle-button btn btn-xs" ng-click="!isCollapseDisabled() && toggle()"><span class="gantt-tree-handle fa fa-fw fa-caret-down" ng-class="{\'fa-caret-right\': collapsed, \'fa-caret-down\': !collapsed}"></span> </a><span gantt-row-label class="gantt-label-text" gantt-bind-once-compile-html="getRowContent()"></div><ol ng-if="childrenRows!=null" ui-tree-nodes ng-class="{hidden: collapsed}" ng-model="childrenRows"><li ng-repeat="row in childrenRows track by row.model.id" ui-tree-node data-collapsed="false"><div ng-include="\'plugins/tree/treeBodyChildren.tmpl.html\'"></div></li></ol>');
    $templateCache.put('plugins/tree/treeHeader.tmpl.html',
        '<div class="gantt-tree-header" gantt-style="{height: $parent.ganttHeaderHeight + \'px\'}"><div ng-if="$parent.ganttHeaderHeight" class="gantt-row-label gantt-row-label-header gantt-tree-row gantt-tree-header-row"><span class="gantt-label-text" gantt-bind-once-compile-html="getHeaderContent()"></div></div>');
}]);

//# sourceMappingURL=angular-gantt-tree-plugin.js.map