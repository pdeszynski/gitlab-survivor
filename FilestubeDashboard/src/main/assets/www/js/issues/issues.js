(function () {
    'use strict';

    angular.module('ftDashboard.issues.issues', ['ftDashboard.components.settings'])
        .factory('issues', ['issuesYoutrack', function (implementation) {
            return implementation;
        }])
        .factory('issuesRedmine',
            ['$resource', '$q', 'projectUri', 'redmineKey', 'maxRecursiveCalls',
            /**
             * An issues backend for a redmine instance
             *
             * @param  {[type]} $resource         [description]
             * @param  {[type]} $q                [description]
             * @param  {[type]} projectUri        [description]
             * @param  {[type]} redmineKey        [description]
             * @param  {[type]} maxRecursiveCalls [description]
             * @return {[type]}                   [description]
             */
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
    .factory('issuesGitlab', ['$resource', '$q', 'gitlabProjectUri', 'gitlabToken',
        /**
         * Factory responsible for obtaining data from gitlab
         */
        function($resource, $q, gitlabProjectUri, gitlabToken) {
        //cause we don't know how many issues are needed and there's no necessary filtering, limit it to 100 issues
        var limit = 100,
            resource = $resource(gitlabProjectUri + 'issues', {private_token: gitlabToken, per_page: limit}, {
                get: {method: 'GET', isArray: true}
            }),
            bugsOpenedSum = 0, bugsByDate = [], bugsSummarized = [], delta = 0,
            dateToDayBeginning = function(dateString) {
                var date = new Date(dateString);
                date.setHours(0);
                date.setMinutes(0);
                date.setSeconds(0);

                return date;
            },
            initDayStat = function(dates, dateString) {
                if (dates[dateString] === undefined) {
                    dates[dateString] = {
                        bugsOpened: 0,
                        bugsClosed: 0
                    };
                }
            };

        return {
            get: function() {
                bugsByDate = [];
                bugsSummarized = [];
                bugsOpenedSum = 0;
                delta = 0;
                var defer = $q.defer(),
                    page = 0,
                    bugsGroupped = {},
                    recursiveGet = function() {
                        page++;
                        resource.get({page: page}, function(issues) {
                            angular.forEach(issues, function(issue) {
                                if (issue.state == "opened") {
                                    ++bugsOpenedSum;
                                }

                                var createdDate = dateToDayBeginning(issue.created_at),
                                    updateDate = dateToDayBeginning(issue.updated_at);
                                createdDate = createdDate.toISOString();
                                updateDate = updateDate.toISOString();
                                initDayStat(bugsGroupped, createdDate);
                                initDayStat(bugsGroupped, updateDate);
                                bugsGroupped[createdDate]['bugsOpened']++;
                                if (issue.state == "closed") {
                                    bugsGroupped[updateDate]['bugsClosed']++;
                                }
                            });

                            if (issues.length < limit) {
                                angular.forEach(bugsGroupped, function(bugs, day) {
                                    bugsByDate.push({
                                        date: new Date(Date.parse(day)),
                                        bugsOpened: bugs.bugsOpened,
                                        bugsClosed: bugs.bugsClosed
                                    });
                                });
                                bugsByDate.sort(function (a, b) {
                                    return a.date.getTime() - b.date.getTime();
                                });
                                defer.resolve(issues);
                            } else {
                                recursiveGet();
                            }
                        }, function(error) {
                            defer.reject(error);
                        });
                    };
                recursiveGet();
                return defer.promise;
            },

            getBugsOpened: function() {
                return bugsOpenedSum;
            },

            getBugsByDate: function(sprintStartDate) {
                var bugsFromDate = [];
                if (sprintStartDate === undefined) {
                    return bugsByDate;
                }

                sprintStartDate = new Date(sprintStartDate);
                sprintStartDate.setHours(0);
                sprintStartDate.setMinutes(0);
                sprintStartDate.setSeconds(0);
                angular.forEach(bugsByDate, function(bug) {
                    if (bug.date >= sprintStartDate) {
                        bugsFromDate.push(bug);
                    }
                });

                return bugsFromDate;
            },

            /**
             * Calculate summarized amount of bugs by date
             * Returns only bugs which are at current sprint
             */
            getBugsSummarized: function(sprintStartDate) {
                var bugsOpened = 0, bugsSummarized = [], bugsByDate = this.getBugsByDate();

                sprintStartDate = new Date(sprintStartDate);
                sprintStartDate.setHours(0);
                sprintStartDate.setMinutes(0);
                sprintStartDate.setSeconds(0);

                for (var i = 0, len = bugsByDate.length; i < len; ++i) {
                    var today = bugsByDate[i];
                    bugsOpened += today.bugsOpened - today.bugsClosed;

                    if (today.date >= sprintStartDate) {
                        //push only ones which are from current sprint on graph
                        bugsSummarized.push({
                            date: today.date,
                            bugsOpened: bugsOpened
                        });
                    }
                }

                return bugsSummarized;
            },

            /**
             * Get info how many bugs increased from the beginning of this sprint
             */
            getBugsDelta: function(sprintStartDate) {
                var delta = 0, bugsSummarized = this.getBugsSummarized(sprintStartDate);
                if (bugsSummarized.length) {
                    delta = bugsSummarized[bugsSummarized.length - 1].bugsOpened - bugsSummarized[0].bugsOpened;
                }

                return delta;
            }
        };
    }])
    .factory('issuesYoutrack', [
        '$resource', '$q', 'youtrackUri', 'youtrackProjectId',
        /**
         * An issues backend for youtrack
         * @param  {Object} $resource         Angular resource
         * @param  {Object} $q                Defered
         * @param  {String} youtrackUri       URI to youtrack
         * @param  {String} youtrackProjectId Id of an youtrack project
         *
         * @return {Object}
         */
        function ($resource, $q, youtrackUri, youtrackProjectId) {
            var filter = {
                sprints: 'Fix versions',
                type:    'Type',
                created: 'Created',
                project: 'Project',
                state:   'State'
            }, Issues = $resource(youtrackUri + 'rest/issue', {max: 100});

            function timestampToDate(timestamp) {
                var date = new Date(parseInt(timestamp));
                toDay(date);
                return date;
            }

            function toDay(aDate) {
                aDate.setHours(0);
                aDate.setMinutes(0);
                aDate.setSeconds(0);
                aDate.setMilliseconds(0);
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

            /**
             * Check if element is numeric
             *
             * @param  {Mixed} n Item to check
             *
             * @return {Boolean}
             */
            function isNumeric(n) {
                return !isNaN(parseFloat(n)) && isFinite(n);
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
                    } else if (isNumeric(element.value)) {
                        str += element.value;
                    }
                    return str;
                }).join(' ');
            }

            function dayStringFromDate(date) {
                return date.getFullYear() +
                    '-' + (date.getMonth() < 9 ? '0' : '') + (date.getMonth() + 1) +
                    '-' + (date.getDate() < 10 ? '0' : '' ) + date.getDate();
            }

            function dateMin(a, b) {
                return [a, b].sort(function (a, b) {
                    return a - b;
                })[0];
            }

            return {
                bugsSprint: function (sprint) {
                    var self = this,
                        startDate = new Date(sprint.start),
                        finishDate = dateMin(new Date(sprint.finish), new Date()),
                        query = queryString([
                        {name: filter.type, value: 'Bug'},
                        {name: filter.project, value: youtrackProjectId},
                        {name: filter.sprints, value: sprint.name}
                    ]);

                    var days = (finishDate - startDate) / (1000*60*60*24);
                    return Issues.get({filter: query}).$promise
                        .then(function (issues) {
                            var groupped = self.countByDate(issues.issue);
                            var keyed = {};
                            angular.forEach(groupped, function (item) {
                                keyed[item.date.toISOString()] = item;
                            });
                            groupped = [];
                            for (var i = days - 1; i + 1 >= 0; --i) {
                                var date = new Date(finishDate.getTime());
                                date.setDate(date.getDate() - i);
                                toDay(date);
                                groupped.push(keyed[date.toISOString()] || {
                                    bugsOpened: 0,
                                    bugsClosed: 0,
                                    date: date
                                });
                            }
                            return groupped;
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
