(function () {
    'use strict';

    angular.module('ftDashboard.mergeRequests.projects', ['ftDashboard.components.settings', 'ngResource'])
        .factory('Project', function () {
            function Project(id, name) {
                this.id = id;
                this.name = name;
            }
            Project.prototype = {
                getId: function () {
                    return this.id;
                },
                getName: function () {
                    return this.name;
                }
            };

            return Project;
        })
        .factory('projects', ['projectsGitlab', function (implementation) {
            return implementation;
        }])
        .factory('projectsGitlab', [
            '$resource', '$q', 'gitlabUri', 'gitlabProjectId', 'gitlabToken', 'Project',
            function ($resource, $q, gitlabUri, gitlabProjectId, gitlabToken, Project) {
                var ProjectResource = $resource(gitlabUri + 'api/v3/projects/:projectId/', {
                    private_token: gitlabToken
                });
                return {
                    get: function() {
                        if (!angular.isArray(gitlabProjectId)) {
                            gitlabProjectId = [gitlabProjectId];
                        }
                        var promises = [];
                        angular.forEach(gitlabProjectId, function (projectId) {
                            //push all promises into an array and wait for them all
                            promises.push(
                                ProjectResource.get({projectId: projectId})
                                    .$promise
                                    .then(function (project) {
                                        return new Project(project.id, project.name);
                                    })
                            );
                        });

                        return $q.all(promises);
                    }
                };
        }])
        ;
})();
