/*
 * Copyright (c) 2013 Hewlett-Packard Development Company, L.P.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 * 	http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

/**
 * A story status label that automatically selects color and text based on
 * the bound-in story.
 */
angular.module('sb.util').directive('storyTaskStatus',
    function (TaskStatus) {
        'use strict';

        return {
            restrict: 'E',
            templateUrl: 'app/util/template/story_task_status.html',
            scope: {
                story: '='
            },
            link: function ($scope) {
                TaskStatus.query({}, function (items) {
                    var statuses = [];
                    for (var i = 0;i < items.length; i++) {
                        statuses[items[i].key] = items[i].name;
                    }

                    $scope.status_texts = statuses;
                });

                $scope.orderStatus = function(item) {
                    var order = [
                        'todo',
                        'inprogress',
                        'review',
                        'invalid',
                        'merged'
                    ];

                    return order.indexOf(item.key);
                };
            }
        };
    });
