/*
 * Copyright (c) 2016 Codethink Ltd.
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
 * The angular resource abstraction that allows us to access branches and their
 * details.
 *
 * @see ResourceFactory
 * @author Adam Coldrick
 */
angular.module('sb.services').factory('Branch',
    function (ResourceFactory) {
        'use strict';

        var resource = ResourceFactory.build(
            '/branches/:id',
            '/branches/search',
            {id: '@id'}
        );

        ResourceFactory.applySearch(
            'Branch',
            resource,
            'name',
            {
              Text: 'q',
              Project: 'project_id'
            }
        );

        return resource;
    });
