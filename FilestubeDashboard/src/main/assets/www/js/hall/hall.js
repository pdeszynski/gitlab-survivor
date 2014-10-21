(function () {
    'use strict';
    angular.module('ftDashboard.hall.hall', ['ngResource', 'ftDashboard.hall.users', 'ftDashboard.hall.sprints', 'ftDashboard.issues.issues'])
        .factory('hall', ['hallYoutrack', function (implementation) {
            return implementation;
        }])
        .factory('hallYoutrack', [
            '$q', 'users', 'sprints', 'issues', 'youtrackEstimationField',
            function ($q, users, sprints, issues, youtrackEstimationField) {
            return {
                get: function () {
                    return $q.all([sprints.getActive(), users.get()])
                        .then(function (values) {
                            var activeSprint = values[0], developers = values[1];
                            console.log('hall - active sprint', activeSprint, ' developers', developers);
                            return issues.sprint(activeSprint)
                                .then(function (sprintIssues) {
                                    console.log('issues this sprint', sprintIssues);
                                    var countByUser = {}, output = [], estimationPoints = 0;
                                    angular.forEach(sprintIssues, function (issue) {
                                        var isResolved = false, assignee;
                                        angular.forEach(issue.field, function (field) {
                                            if (field.name === 'resolved') {
                                                isResolved = true;
                                            }
                                            if (field.name === 'Assignee') {
                                                assignee = field.value[0].value;
                                            }
                                            if (field.name === youtrackEstimationField) {
                                                estimationPoints = parseFloat(field.value[0]) || 0;
                                            }
                                        });
                                        if (isResolved && assignee) {
                                            if (!countByUser[assignee]) {
                                                countByUser[assignee] = 0;
                                            }
                                            countByUser[assignee]++;
                                            countByUser[assignee] += estimationPoints;
                                        }
                                    });
                                    angular.forEach(developers, function (developer) {
                                        output.push({
                                                name: developer.login,
                                                issues_solved: countByUser[developer.login] ? countByUser[developer.login] : 0
                                            }
                                        );
                                    });
                                    output.sort(function (a, b) {
                                        return b.issues_solved - a.issues_solved;
                                    });

                                    return output;
                                });
                        });
                }
            };
        }]);
})();
