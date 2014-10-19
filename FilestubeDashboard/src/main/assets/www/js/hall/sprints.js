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
                    //sprints that doesn't have yet start and the end
                    //doesn't count at all
                    if (!sprint.finish || !sprint.start) {
                        return false;
                    }
                    var start = normalizeDate(sprint.start),
                        end = normalizeDate(sprint.finish);
                    //move to the midnight (start of the next day)
                    end.setHours(24);
                    return start <= now && end >= now;
                }
                function normalizeDate(dateString) {
                    if (dateString === 'Today') {
                        var date = new Date();
                        date.setHours(0);
                        date.setMinutes(0);
                        date.setSeconds(0);
                        date.setMilliseconds(0);
                        return date;
                    }
                    return new Date(dateString + " " + now.getUTCFullYear());
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
                                        sprint.start  = normalizeDate(sprint.start);
                                        sprint.finish = normalizeDate(sprint.finish);
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
