(function () {
    'use strict';

    angular.module('ftDashboard.mergeRequests.mergeRequests', ['ftDashboard.components.settings'])
        .factory('mergeRequests', ['mergeRequestsGitlab', function (implementation) {
            return implementation;
        }])
        .factory('mergeRequestsGitlab', ['$resource', '$q', 'gitlabProjectUri', 'gitlabToken', 'maxRecursiveCalls',
            /**
             * Factory responsible for merge requests data from gitlab
             */
            function($resource, $q, gitlabProjectUri, gitlabToken, maxRecursiveCalls) {
                var limit = 100, resource = $resource(gitlabProjectUri + 'merge_requests', {
                            private_token: gitlabToken,
                            per_page: limit,
                            state: 'opened'
                        }, {
                        get: {method: 'GET', isArray: true}
                    }),
                    mergeRequestsCount = 0,
                    page = 0,
                    openRequests = [];

                return {
                    get: function() {
                        openRequests = [];
                        var defer = $q.defer(),
                            mergeRequestsCount = 0,
                            recursionDepth = 0,
                            page = 0,
                            recursiveGet = function() {
                                page++;
                                resource.get({page: page}, function(mergeRequests) {
                                    angular.forEach(mergeRequests, function(request) {
                                        if (request.state == "opened") {
                                            ++mergeRequestsCount;
                                            openRequests.push(request);
                                        }
                                    });
                                    if (mergeRequests.length == limit && maxRecursiveCalls > recursionDepth) {
                                        recursionDepth++;
                                        recursiveGet();
                                    } else {
                                        defer.resolve(mergeRequestsCount);
                                    }
                                }, function(error) {
                                   defer.reject(error);
                                });

                            };
                        recursiveGet();

                        return defer.promise;
                    },
                    getMergeReady: function() {
                        if (openRequests.length === 0) {
                            this.get().then(this.getMergeReady);
                        }
                        //TODO: use q.all([promises]);
                        angular.forEach(openRequests, function(request) {

                        });
                    }
                };
        }])

        .factory('gitlabMergeComments', ['$resource', '$q', 'gitlabProjectUri', 'gitlabToken',
                function ($resource, $q, gitlabProjectUri, gitlabToken) {
        }])
        ;
})();
