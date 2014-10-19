(function () {
    'use strict';

    angular.module('ftDashboard.mergeRequests.mergeRequests', [
            'ftDashboard.components.settings',
            'ftDashboard.mergeRequests.projects',
            'ngResource'
        ])
        .factory('MergeRequestsModel', function () {
            function MergeRequests(projectName, count) {
                this.projectName = projectName;
                this.count = count;
            }

            MergeRequests.prototype = {
                getProjectName: function () {
                    return this.projectName;
                },
                getCount: function () {
                    return this.count;
                }
            };
            return MergeRequests;
        })
        .factory('mergeRequests', ['mergeRequestsGitlab', function (implementation) {
            return implementation;
        }])
        .factory('mergeRequestsGitlab', [
            '$resource', '$q', 'gitlabUri', 'gitlabProjectId', 'gitlabToken', 'projects', 'MergeRequestsModel',
            /**
             * Factory responsible for merge requests data from gitlab
             */
            function($resource, $q, gitlabUri, gitlabProjectId, gitlabToken, projects, MergeRequestsModel) {
                var limit = 100, MergeRequests = $resource(gitlabUri + 'api/v3/projects/:projectId/merge_requests', {
                            private_token: gitlabToken,
                            per_page: limit,
                            state: 'opened'
                        });

                return {
                    get: function() {
                        return projects.get()
                            .then(function (projects) {
                                var promises = [];
                                angular.forEach(projects, function (project) {
                                    promises.push(MergeRequests.query({projectId: project.getId()})
                                        .$promise
                                        .then(function (mr) {
                                            return new MergeRequestsModel(project.getName(), mr.length);
                                        })
                                    );
                                });

                                return $q.all(promises);
                            });
                    }
                };
        }])

        .factory('gitlabMergeComments', ['$resource', '$q', 'gitlabProjectUri', 'gitlabToken',
                function ($resource, $q, gitlabProjectUri, gitlabToken) {
        }])
        ;
})();
