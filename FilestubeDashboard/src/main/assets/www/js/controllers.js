'use strict';

/* Controllers */

angular.module('ftDashboard.controllers', []).
    controller('Index', [
        '$scope', '$q', '$timeout',
        'Versions', 'tasks', 'GroupUsers', 'Jenkins',
        'gitlabIssues', 'gitlabMergeRequests',
        'lastVersion', 'groupId', 'hall', 'hallLength',
        function($scope, $q, $timeout, Versions, tasks, GroupUsers, Jenkins, gitlabIssues, gitlabMergeRequests, lastVersion, groupId, hall, hallLength) {
            //has to have default values, cause it will crash - chart can start drawing before data was applied to DOM
            $scope.bugsByDate = [{date: '0000-00-00T00:00:00+02:00', bugsOpened: '0', bugsClosed: '0'}];
            $scope.bugsSummarized = [{date: '0000-00-00T00:00:00+02:00', bugsOpened: '0'}];
            $scope.bugsOpen = 0;
            $scope.delta = 0;
            $scope.wasBuildSuccessful = true;
            $scope.mergeRequests = 0;
            //TODO: now $q has .all function which can wait for all defereds
            //change the code to make it easier, without callback hell
            (function tick() {
                //poll jenkins build status
                Jenkins.get()
                    .then(function (projectInfo) {
                        $scope.wasBuildSuccessful = Jenkins.wasSuccessful();
                        $scope.buildInProgress = Jenkins.inProgress();
                    }, function (error) {
                        console.log('An error occured while obtaining data from Jenkins');
                        console.log(error);
                    })
                    .finally(function() {
                        $timeout(tick, 5000);
                    });
            })();
            (function tick() {
                //poll for merge requests
                gitlabMergeRequests.get()
                    .then(function (count) {
                        $scope.mergeRequests = count;
                    }, function (error) {
                        console.log('An error occured while obtaining merge requests');
                        console.log(error);
                    })
                    .finally(function () {
                        $timeout(tick, 30000);
                    });
            })();
            (function tick() {
                var versionsDefer = $q.defer(),
                    tasksDefer = $q.defer();
                Versions.get({}, function(versions) {
                    versionsDefer.resolve(versions);

                }, function (error) {
                    console.log('Could not obtain versions');
                    versionsDefer.reject();
                });

                versionsDefer.promise.then(function (versions) {
                    var version = lastVersion(versions);

                    tasks.get(version.id).then(
                        function(tasks) {
                            tasksDefer.resolve(tasks);
                        },
                        function (error) {
                            console.log('Could not obtain tasks list for current sprint');
                            tasksDefer.reject();
                        }
                    );

                    gitlabIssues.get()
                        .then(function(issues) {
                            $scope.bugsOpen = gitlabIssues.getBugsOpened();
                            $scope.bugsByDate = gitlabIssues.getBugsByDate(version.created_on);
                            $scope.bugsSummarized = gitlabIssues.getBugsSummarized(version.created_on);
                            console.log($scope.bugsSummarized);
                            $scope.delta = gitlabIssues.getBugsDelta(version.created_on);

                            //TODO: move this to directive!
                            $timeout(survivor.dashboard.init, 200);
                        }, function(error) {
                            console.log("An error occured obtaining issues from gitlab");
                            console.log(error);
                        });
                }, function(error) {
                    console.log('An error occured');
                    console.log(error);
                });

                tasksDefer.promise.then(function(tasks) {
                    GroupUsers.get({group_id: groupId}, function (users) {
                        var hallDevelopers = hall(tasks, users);
                        //change it to array
                        var devsArray = [];
                        angular.forEach(hallDevelopers, function(item) {
                            devsArray.push(item);
                        });
                        devsArray.sort(function(a, b) {
                            return a.issues_solved > b.issues_solved;
                        });

                        $scope.shame = devsArray.slice(0, hallLength).reverse();
                        $scope.fame = devsArray.slice(-hallLength).reverse();
                    },
                    function(error) {
                        console.log('Could not get list of users');
                    });
                });
                $timeout(tick, 30000);
            })();
        }
    ])
    .controller('MyCtrl2', [function() {

    }]);