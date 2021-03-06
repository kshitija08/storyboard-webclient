/*
 * Copyright (c) 2016 Codethink Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License. You may obtain
 * a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations
 * under the License.
 */


/**
 * This criteria resolver may be injected by individual resources that accept a
 * Tags search parameter.
 *
 * @see ResourceFactory
 */
angular.module('sb.services').factory('Tags',
    function (ResourceFactory) {
        'use strict';

        var resource = ResourceFactory.build(
            '/tags/:id',
            '/tags/search',
            {id: '@id'}
        );

        ResourceFactory.applySearch(
            'Tags',
            resource,
            'name',
            {},
            true // Use the name field for browse criteria, instead of the ID
        );

        return resource;
    });
