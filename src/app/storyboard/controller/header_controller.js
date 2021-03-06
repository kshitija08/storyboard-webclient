/*
 * Copyright (c) 2014 Hewlett-Packard Development Company, L.P.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */

/**
 * Controller for our application header. Includes a typeahead-style quicknav
 * and search box.
 */
angular.module('storyboard').controller('HeaderController',
    function ($q, $scope, $rootScope, $state, $modal, NewStoryService,
              Session, SessionState, CurrentUser, Criteria, Notification,
              Priority, Project, Story, ProjectGroup, NewWorklistService,
              NewBoardService, SessionModalService, Severity, Task) {
        'use strict';

        function resolveCurrentUser() {
            CurrentUser.resolve().then(
                function (user) {
                    $scope.currentUser = user;
                },
                function () {
                    $scope.currentUser = null;
                }
            );
        }

        resolveCurrentUser();

        /**
         * Load and maintain the current user.
         */
        $scope.currentUser = null;

        /**
         * Create a new story.
         */
        $scope.newStory = function () {
            var projectId = null;
            if ($state.current.name === 'sb.project.detail') {
                projectId = $state.params.id;
            }
            NewStoryService.showNewStoryModal(projectId)
                .then(function (story) {
                    // On success, go to the story detail.
                    $scope.showMobileNewMenu = false;
                    $state.go('sb.story.detail', {storyId: story.id});
                }
            );
        };

        /**
         * Create a new worklist.
         */
        $scope.newWorklist = function () {
            NewWorklistService.showNewWorklistModal()
                .then(function (worklist) {
                    // On success, go to the worklist detail.
                    $scope.showMobileNewMenu = false;
                    $state.go('sb.worklist.detail',
                              {worklistID: worklist.id});
                }
            );
        };

        /**
         * Create a new board.
         */
        $scope.newBoard = function () {
            NewBoardService.showNewBoardModal()
                .then(function (board) {
                    // On success, go to the board detail.
                    $scope.showMobileNewMenu = false;
                    $state.go('sb.board.detail', {boardID: board.id});
                }
            );
        };

        /**
         * Create a new project.
         */
        $scope.newProject = function () {
            $scope.modalInstance = $modal.open({
                size: 'lg',
                templateUrl: 'app/projects/template/new.html',
                backdrop: 'static',
                controller: 'ProjectNewController'
            });
        };

        /**
         * Create a new project-group.
         */
        $scope.newProjectGroup = function () {
            $scope.modalInstance = $modal.open(
                {
                    templateUrl: 'app/project_group/template/new.html',
                    backdrop: 'static',
                    controller: 'ProjectGroupNewController'
                });

            $scope.modalInstance.result.then(function (projectGroup) {
                    // On success, go to the project group detail.
                    $scope.showMobileNewMenu = false;
                    $state.go(
                        'sb.project_group.detail',
                        {id: projectGroup.id}
                    );
                });
        };

        /**
         * Show modal informing the user login is required.
         */
        $scope.showLoginRequiredModal = function() {
            SessionModalService.showLoginRequiredModal();
        };

        /**
         * Log out the user.
         */
        $scope.logout = function () {
            Session.destroySession();
        };

        /**
         * Initialize the search string.
         */
        $scope.searchString = '';

        /**
         * Send the user to search and clear the header search string.
         */
        $scope.search = function (criteria) {

            switch (criteria.type) {
                case 'Text':
                    $state.go('sb.search', {q: criteria.value});
                    break;
                case 'ProjectGroup':
                    $state.go('sb.project_group.detail', {id: criteria.value});
                    break;
                case 'Project':
                    $state.go('sb.project.detail', {id: criteria.value});
                    break;
                case 'Story':
                    $state.go('sb.story.detail', {storyId: criteria.value});
                    break;
                case 'Task':
                    $state.go('sb.task', {taskId: criteria.value});
                    break;
            }

            $scope.searchString = '';
        };

        /**
         * Filter down the search string to actual resources that we can
         * browse to directly (Explicitly not including users here). If the
         * search string is entirely numeric, we'll instead do a
         * straightforward GET :id.
         */
        $scope.quickSearch = function (searchString) {
            var deferred = $q.defer();

            searchString = searchString || '';

            var searches = [];
            var headerGET = false;

            Notification.intercept(function(message) {
                if (message.type === 'http' &&
                    message.severity === Severity.ERROR &&
                    message.message === 404 &&
                    headerGET
                ) {
                    return true;
                }
            });

            if (searchString.match(/^[0-9]+$/)) {
                var getProjectGroupDeferred = $q.defer();
                var getProjectDeferred = $q.defer();
                var getStoryDeferred = $q.defer();
                var getTaskDeferred = $q.defer();
                headerGET = true;

                ProjectGroup.get({id: searchString},
                    function (result) {
                        getProjectGroupDeferred.resolve(Criteria.create(
                            'ProjectGroup', result.id, result.name
                        ));
                    }, function () {
                        getProjectGroupDeferred.resolve(null);
                    });
                Project.get({id: searchString},
                    function (result) {
                        getProjectDeferred.resolve(Criteria.create(
                            'Project', result.id, result.name
                        ));
                    }, function () {
                        getProjectDeferred.resolve(null);
                    });
                Story.get({id: searchString},
                    function (result) {
                        getStoryDeferred.resolve(Criteria.create(
                            'Story', result.id, result.title
                        ));
                    }, function () {
                        getStoryDeferred.resolve(null);
                    });
                Task.get({id: searchString},
                    function (result) {
                        getTaskDeferred.resolve(Criteria.create(
                            'Task', result.id, result.title
                        ));
                    }, function () {
                        getTaskDeferred.resolve(null);
                    });

                // If the search string is entirely numeric, do a GET.
                searches.push(getProjectGroupDeferred.promise);
                searches.push(getProjectDeferred.promise);
                searches.push(getStoryDeferred.promise);
                searches.push(getTaskDeferred.promise);

            } else {
                searches.push(ProjectGroup.criteriaResolver(searchString, 5));
                searches.push(Project.criteriaResolver(searchString, 5));
                searches.push(Story.criteriaResolver(searchString, 5));
            }
            $q.all(searches).then(function (searchResults) {
                headerGET = false;
                var criteria = [
                    Criteria.create('Text', searchString)
                ];


                /**
                 * Add a result to the returned criteria.
                 */
                var addResult = function (item) {
                    criteria.push(item);
                };

                for (var i = 0; i < searchResults.length; i++) {
                    var results = searchResults[i];

                    if (!results) {
                        continue;
                    }

                    if (!!results.forEach) {

                        // If it's iterable, do that. Otherwise just add it.
                        results.forEach(addResult);
                    } else {
                        addResult(results);
                    }
                }

                deferred.resolve(criteria);
            });

            // Return the search promise.
            return deferred.promise;
        };

        // Watch for changes to the session state.
        Notification.intercept(function (message) {
            switch (message.type) {
                case SessionState.LOGGED_IN:
                    resolveCurrentUser();
                    break;
                case SessionState.LOGGED_OUT:
                    $scope.currentUser = null;
                    break;
                default:
                    break;
            }
        }, Priority.LAST);
    });
