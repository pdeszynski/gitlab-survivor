(function () {
    'use strict';
    angular.module('ftDashboard.build.status', ['ftDashboard.components.settings'])

        .factory('buildStatus', ['buildStatusJenkins', function (implementation) {
            return implementation;
        }])
        .factory('buildStatusJenkins', ['$resource', '$q', 'jenkinsProjectUri', 'jenkinsToken',
            function ($resource, $q, jenkinsProjectUri, jenkinsToken) {
                var resource = $resource(jenkinsProjectUri, {token: jenkinsToken}),
                    projectInfo = {};

                return {
                    get: function()  {
                        var defer = $q.defer();

                        resource.get({}, function (project) {
                           projectInfo = project;
                           defer.resolve(project);
                        }, function (error) {
                            defer.reject(error);
                        });

                        return defer.promise;
                    },
                    inProgress: function() {
                        return projectInfo.building;
                    },
                    wasSuccessful: function() {
                        return this.inProgress() || projectInfo.result === "SUCCESS";
                    }
                };
        }])
        ;
})();
