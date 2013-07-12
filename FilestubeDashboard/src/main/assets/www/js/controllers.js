'use strict';

/* Controllers */

angular.module('ftDashboard.controllers', []).
    controller('Index', [
        '$scope', '$q', '$timeout',
        'Versions', 'issues', 'GroupUsers', 'Jenkins',
        'gitlabIssues', 'gitlabMergeRequests',
        'lastVersion', 'groupId', 'hall', 'hallLength',
        function($scope, $q, $timeout, Versions, issues, GroupUsers, Jenkins, gitlabIssues, gitlabMergeRequests, lastVersion, groupId, hall, hallLength) {
            //has to have default values, cause it will crash - chart can start drawing before data was applied to DOM
            $scope.bugsByDate = [{date: '0000-00-00T00:00:00+02:00', bugsOpened: '0', bugsClosed: '0'}];
            $scope.bugsSummarized = [{date: '0000-00-00T00:00:00+02:00', bugsOpened: '0'}];
            $scope.bugsOpen = 0;
            $scope.delta = 0;
            $scope.wasBuildSuccessful = true;
            $scope.mergeRequests = 0;

            var getData = function () {

                gitlabMergeRequests.get()
                    .then(function (count) {
                        $scope.mergeRequests = count;
                    }, function (error) {
                        console.log('An error occured while obtaining merge requests');
                        console.log(error);
                    });

                Jenkins.get()
                    .then(function (projectInfo) {
                        $scope.wasBuildSuccessful = Jenkins.wasSuccessful();
                    }, function (error) {
                        console.log('An error occured while obtaining data from Jenkins');
                        console.log(error);
                    });

                var defer = $q.defer();
                Versions.get({}, function(versions) {
                    defer.resolve(versions);

                }, function (error) {
                    console.log('Could not obtain versions');
                    defer.reject();
                });

                defer.promise.then(function (versions) {
                    var version = lastVersion(versions),
                        defer = $q.defer();

                    console.log('version');
                    console.log(version);
                    issues.get(version.id).then(
                        function(issues) {
                            defer.resolve(issues);
                        },
                        function (error) {
                            console.log('Could not obtain issues list for current sprint');
                            defer.reject();
                        }
                    );

                    gitlabIssues.get()
                        .then(function(issues) {
                            $scope.bugsOpen = gitlabIssues.getBugsOpened();
                            $scope.bugsByDate = gitlabIssues.getBugsByDate(version.created_on);
                            $scope.bugsSummarized = gitlabIssues.getBugsSummarized(version.created_on);
                            $scope.delta = gitlabIssues.getBugsDelta(version.created_on);

                            //TODO: move this to directive!
                            $timeout(survivor.dashboard.init, 200);
                        }, function(error) {
                            console.log("An error occured obtaining issues from gitlab");
                            console.log(error);
                        });
                    return defer.promise;
                }, function(error) {
                    console.log('An error occured');
                    console.log(error);
                })
                .then(function(issues) {
                    GroupUsers.get({group_id: groupId}, function (users) {
                        var hallDevelopers = hall(issues, users);
                        //change it to array
                        var devsArray = [];
                        angular.forEach(hallDevelopers, function(item) {
                            devsArray.push(item);
                        });
                        devsArray.sort(function(a, b) {
                            return a.issues_solved > b.issues_solved;
                        });

                        $scope.shame = devsArray.slice(0, hallLength);
                        $scope.fame = devsArray.slice(-hallLength).reverse();
                    },
                    function(error) {
                        console.log('Could not get list of users');
                    });
                });
                $timeout(getData, 15000);
            }
            getData();
        }
    ])
    .controller('MyCtrl2', [function() {

    }]);