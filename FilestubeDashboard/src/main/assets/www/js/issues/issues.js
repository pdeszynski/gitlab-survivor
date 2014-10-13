(function () {
    'use strict';

    angular.module('ftDashboard.issues.issues', [])
        .factory('issues', ['issuesYoutrack', function (implementation) {
            return implementation;
        }])
        .factory('issues-redmine',
            ['$resource', '$q', 'projectUri', 'redmineKey', 'maxRecursiveCalls',
            function($resource, $q, projectUri, redmineKey, maxRecursiveCalls) {
                var limit = 100,
                    resource = $resource(projectUri + 'issues.json', {key: redmineKey, status_id: '*', limit: limit});

                return {
                    /**
                    * Recursively get all issues from current fixed version (current sprint).
                    * It has to be done recusirvely because redmine has hardcoded 100 items limit,
                    * and you cannot be sure that there are less than 100 items.
                    */
                    get: function(fixedVersionId) {
                        var defer = $q.defer(),
                            offset = 0,
                            recursionDepth = 0,
                            allIssues = [],
                            recursiveGet = function () {
                                resource.get({fixed_version_id: fixedVersionId, offset: offset}, function(issues) {
                                    angular.forEach(issues.issues, function(issue) {
                                        allIssues.push(issue);
                                    });
                                    if (issues.issues.length == limit && maxRecursiveCalls > recursionDepth) {
                                        offset += limit;
                                        recursionDepth++;
                                        recursiveGet();
                                    } else {
                                        defer.resolve(allIssues);
                                    }
                                }, function(error) {
                                    defer.reject(error);
                                });
                            };

                        recursiveGet();
                        return defer.promise;
                    }
                };
            }
        ]
    )
    .factory('issuesYoutrack', [
        '$resource', '$q', 'youtrackUri', 'youtrackProjectId',
        function ($resource, $q, youtrackUri, youtrackProjectId) {
            var filter = {
                sprints: 'Fix versions',
                type: 'Type',
                created: 'Created',
                project: 'Project',
                state: 'State'
            }, Issues = $resource(youtrackUri + 'rest/issue', {max: 100});

            function timestampToDate(timestamp) {
                var date = new Date(parseInt(timestamp));
                date.setHours(0);
                date.setMinutes(0);
                date.setSeconds(0);
                date.setMilliseconds(0);
                return date;
            }

            function init() {
                return {
                    opened: 0,
                    closed: 0
                };
            }

            function DateRange(from, to) {
                this.from = from;
                this.to = to;
            }

            function queryString(filters) {
                var valueSeparator = ': ';
                return filters.map(function (element) {
                    var str = element.name + valueSeparator;
                    if (typeof element.value === 'string') {
                        var negate = element.value.indexOf('-') === 0 ? '-' : '';
                        str += negate + '{' + (negate.length ? element.value.substr(1) : element.value) + '}';
                    } else if (element.value instanceof DateRange) {
                        str += element.value.from + ' .. ' + element.value.to;
                    }
                    return str;
                }).join(' ');
            }

            function dayStringFromDate(date) {
                return date.getFullYear() +
                    '-' + (date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1) +
                    '-' + (date.getDate() < 10 ? '0' : '' ) + date.getDate();
            }

            return {
                bugsSprint: function (sprint) {
                    var query = queryString([
                        {name: filter.type, value: 'Bug'},
                        {name: filter.project, value: youtrackProjectId},
                        {name: filter.sprints, value: sprint.name}
                    ]);
                    return Issues.get({filter: query}).$promise
                        .then(function (issues) {
                            return issues.issue;
                        });
                },
                bugsOpened: function () {
                    var query = queryString([
                        {name: filter.type, value: 'Bug'},
                        {name: filter.project, value: youtrackProjectId},
                        {name: filter.state, value: '-Resolved'}
                    ]);
                    return Issues.get({filter: query}).$promise
                        .then(function (issues) {
                            return issues.issue;
                        });
                },
                countBugsSum: function (forDays) {
                    var minimalDate = new Date(0),
                        fromDate = new Date(),
                        self = this;
                    fromDate.setDate(fromDate.getDate() - forDays);

                    var query = queryString([
                        {name: filter.type, value: 'Bug'},
                        {name: filter.project, value: 'Project'},
                        {name: filter.state, value: '-Resolved'},
                        {name: filter.created, value: new DateRange(dayStringFromDate(minimalDate), dayStringFromDate(fromDate))}
                    ]);
                    return Issues.get({filter: query}).$promise
                        .then(function (bugsUntil) {
                            return bugsUntil.issue.length;
                        })
                        .then(function (bugsUntilCount) {
                            var query = queryString([
                                {name: filter.type, value: 'Bug'},
                                {name: filter.project, value: youtrackProjectId},
                                {name: filter.created, value: new DateRange(dayStringFromDate(fromDate), dayStringFromDate(new Date()))}
                            ]), defer = $q.defer();

                            Issues.get({filter: query}, function (issuesForDaysLimit) {
                                defer.resolve([bugsUntilCount, issuesForDaysLimit.issue]);
                            }, function () {defer.reject("An error occured while obtaining issues for sprint");});
                            return defer.promise;
                        })
                        .then(function (issues) {
                            var bugsUntilCount = issues[0], issuesForDaysLimit = issues[1];
                            var groupped = self.countByDate(issuesForDaysLimit);
                            if (!groupped.length) {
                                groupped.push({
                                    bugsOpened: 0,
                                    bugsClosed: 0,
                                    date: new Date()
                                });
                            }
                            groupped[0].bugsOpened += bugsUntilCount;
                            for (var i = 1, len = groupped.length; i < len; ++i) {
                                groupped[i].bugsOpened += groupped[i - 1].bugsOpened - groupped[i].bugsClosed;
                            }

                            return groupped;
                        });
                },
                sprint: function (sprint) {
                    var query = queryString([
                        {name: filter.sprints, value: sprint.name},
                        {name: filter.project, value: youtrackProjectId}
                    ]);
                    return Issues.get({filter: query}).$promise
                        .then(function (issues) {
                            return issues.issue;
                        });
                },
                countByDate: function (issues) {
                    var groupped = {},
                        output = [],
                        createdField = 'created',
                        resolvedField = 'resolved';

                    angular.forEach(issues, function (issue) {
                        var created, resolved;
                        for (var index in issue.field) {
                            var field = issue.field[index];
                            if (field.name === createdField) {
                                created = timestampToDate(field.value);
                            }
                            if (field.name === resolvedField) {
                                resolved = timestampToDate(field.value);
                            }
                        }
                        if (created === null) {
                            throw new Error("Date field is missing, cannot create by date");
                        }

                        if (!groupped[created.toISOString()]) {
                            groupped[created.toISOString()] = init();
                        }
                        groupped[created.toISOString()].opened++;
                        if (resolved) {
                            //some issues might be still unresolved, they do not have
                            //resolved field
                            if (!groupped[resolved.toISOString()]) {
                                groupped[resolved.toISOString()] = init();
                            }
                            groupped[resolved.toISOString()].closed++;
                        }
                    });

                    angular.forEach(groupped, function (count, date) {
                        output.push({
                            date: new Date(date),
                            bugsOpened: count.opened,
                            bugsClosed: count.closed
                        });
                    });
                    output.sort(function (a, b) {
                        return a.date.getTime() - b.date.getTime();
                    });
                    return output;
                }
            };
        }
    ]);
})();
