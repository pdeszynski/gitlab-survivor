'use strict';

/* Controllers */

angular.module('ftDashboard.controllers', [
        'ftDashboard.components.login',
        'ftDashboard.hall.hall',
        'ftDashboard.hall.sprints',
        'ftDashboard.issues.issues',
        'ftDashboard.build.status',
        'ftDashboard.mergeRequests.mergeRequests'
    ]).
    controller('Index', [
        '$scope', '$q', '$timeout', 'backendLogin', 'sprints', 'issues', 'buildStatus', 'mergeRequests', 'hall', 'hallLength',
        function($scope, $q, $timeout, backendLogin, sprints, issues, buildStatus, mergeRequests, hall, hallLength) {
            //has to have default values, cause it will crash - chart can start drawing before data was applied to DOM
            $scope.bugsByDate = [{date: '0000-00-00T00:00:00+02:00', bugsOpened: '0', bugsClosed: '0'}];
            $scope.bugsSummarized = [{date: '0000-00-00T00:00:00+02:00', bugsOpened: '0'}];
            $scope.bugsOpen = 0;
            $scope.delta = 0;
            $scope.wasBuildSuccessful = true;
            $scope.mergeRequests = 0;
            backendLogin.login()
                .then(function () {
                    sprints.getActive()
                        .then(function (sprint) {
                            function tick() {
                                issues.bugsOpened()
                                    .then(function (bugs) {
                                        console.log('bugs opened', bugs.length);
                                        $scope.bugsOpen = bugs.length;
                                    });
                                issues.bugsSprint(sprint)
                                    .then(function (bugs) {
                                        var byDate = issues.countByDate(bugs);
                                        console.log('bugsByDate', byDate);
                                        $scope.bugsByDate = byDate;
                                    });
                                issues.countBugsSum(14)
                                    .then(function (sum) {
                                        $scope.bugsSummarized = sum;
                                        $scope.delta = sum[sum.length - 1].bugsOpened - sum[0].bugsOpened;
                                    });

                                $timeout(survivor.dashboard.init, 200);
                                $timeout(tick, 30 * 1000);
                            }
                            tick();
                        }, function () {
                            console.log('An error occured while obtaining issues from backend');
                        });
                    function generateHall() {
                        hall.get()
                            .then(function (hallUsers) {
                                console.log('hall users', hallUsers);
                                $scope.fame = hallUsers.slice(0, hallLength);
                                $scope.shame = hallUsers.slice(-hallLength).reverse();
                            }
                        );
                        $timeout(generateHall, 30 * 1000);
                    }
                    generateHall();
                }, function () {
                    console.log('An error occured while login in to youtrack');
                });
            //TODO: now $q has .all function which can wait for all defereds
            //change the code to make it easier, without callback hell
            (function tick() {
                //poll jenkins build status
                buildStatus.get()
                    .then(function (projectInfo) {
                        $scope.wasBuildSuccessful = buildStatus.wasSuccessful();
                        $scope.buildInProgress = buildStatus.inProgress();
                    }, function (error) {
                        console.log('An error occured while obtaining data from buildStatus');
                        console.log(error);
                    })
                    .finally(function() {
                        $timeout(tick, 5000);
                    });
            })();
            (function tick() {
                //poll for merge requests
                mergeRequests.get()
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
        }
    ]);
