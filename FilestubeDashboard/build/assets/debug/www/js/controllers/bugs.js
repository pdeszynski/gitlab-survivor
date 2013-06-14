function BugsController($scope) {
    $scope.bugsByDate = [];
    $scope.bugsSummarized = [];
    $scope.bugsOpen = 0;
    $.ajax({
        url: 'https://git.red-sky.pl/api/v3/projects/' + app.settings.gitlabProjectId + '/issues',
        data: {
            private_token: app.settings.gitlabToken,
            per_page: 100
        },
        success: function(response) {
            var bugsByDate = {};
            console.log(response);
            for (var item in response) {
                item = response[item];
                if (item.closed == false) {
                    $scope.bugsOpen++;
                }
                var date = item.created_at.split('T')[0] + 'T00:00:00+02:00';
                if (bugsByDate[date] === undefined) {
                    bugsByDate[date] = {
                        bugsOpened: 0,
                        bugsClosed: 0
                    }
                }
                bugsByDate[date][item.closed == false ? 'bugsOpened' : 'bugsClosed']++;
            }

            for (var day in bugsByDate) {
                $scope.bugsByDate.push({
                    date: day,
                    bugsOpened: bugsByDate[day].bugsOpened,
                    bugsClosed: bugsByDate[day].bugsClosed
                });
            }

            var bugsOpened = $scope.bugsOpen;
            for (var i = 0, len = $scope.bugsByDate.length; i < len; ++i) {
                var today = $scope.bugsByDate[i];
                bugsOpened -= today.bugsClosed;
                if (bugsOpened < 0) bugsOpened = 0;
                $scope.bugsSummarized.push({
                    date: today.date,
                    bugsOpened: bugsOpened
                });
            }

            $scope.bugsByDate.reverse();
            $scope.bugsSummarized.reverse();
            $scope.$apply();
            survivor.dashboard.init();
        },
        error: function(par1, par2, errorThrown) {
            alert("Error communicating with GitLab");
            console.log(par1);
            console.log(par2);
        }
    });
}