(function () {
    'use strict';
    angular.module('ftDashboard.hall.sprints', ['ngResource', 'ftDashboard.components.settings'])
        .factory('sprints', ['sprintsYoutrack', function (sprintsYoutrack) {
            return sprintsYoutrack;
        }])
        .factory('sprintsYoutrack', [
            '$resource', '$q', 'youtrackUri', 'youtrackProjectId', 'youtrackAgileBoard',
            function ($resource, $q, youtrackUri, youtrackProjectId, youtrackAgileBoard) {
                var Agiles = $resource(youtrackUri + 'rest/agile/agiles', {}, {
                    get: {method: 'GET', isArray: true}
                }),
                    Sprints = $resource(youtrackUri + 'rest/agile/:agileId/sprints', {}, {
                        get: {method: 'GET', isArray: false}
                    });
                var now = new Date();
                function filterSprints(sprint) {
                    if (!sprint.finish || !sprint.start) {
                        return false;
                    }
                    var start = new Date(sprint.start + " " + now.getUTCFullYear()),
                        end = new Date(sprint.finish + " " + now.getUTCFullYear());
                    //move to the midnight (start of the next day)
                    end.setHours(24);
                    return start <= now && end >= now;
                }
                return {
                    //rename to getActive
                    getActive: function () {
                        var promise = Agiles.get({}).$promise.then(
                            function (agiles) {
                                var filtered = agiles.filter(function (agile) {
                                    return agile.id.indexOf(youtrackAgileBoard + '-') === 0;
                                });
                                if (!filtered.length) {
                                    throw new Error("No agile matching pattern: " +
                                        youtrackAgileBoard +
                                        "- was found, please verify setting: 'youtrackAgileBoard' if it's correct" +
                                        " and matches any board");
                                }

                                var agile = filtered.pop();
                                return agile;
                        }, function () {
                            throw new Error("An error occured while obtaining agiles");
                        })
                        .then(function (agile) {
                            return Sprints.get({agileId: agile.id}).$promise
                                .then(function (sprints) {
                                    var filtered = sprints.sprint.filter(filterSprints);
                                    if (!filtered.length) {
                                        throw new Error("There is no active sprint");
                                    }
                                    angular.forEach(filtered, function (sprint) {
                                        sprint.start  = new Date(sprint.start + " " + now.getUTCFullYear());
                                        sprint.finish = new Date(sprint.finish + " " + now.getUTCFullYear());
                                    });
                                    return filtered.pop();
                                });
                        }, function () {
                            throw new Error("An error occured while obtaining sprints");
                        });
                        return promise;
                    }
                };
            }
        ]);
})();
