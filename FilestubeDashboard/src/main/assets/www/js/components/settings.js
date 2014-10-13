(function () {
    'use strict';
    angular.module('ftDashboard.components.settings', [])
        .value('youtrackUri', 'Your YoutrackUri with trailing slash')
        .value('youtrackLogin', 'your youtrack login with admin rights')
        .value('youtrackPassword', 'your password')
        .value('youtrackProjectId', 'your youtrack project ID')
        .value('youtrackUserRole', 'youtrack user role to be tracked in hall')
        .value('youtrackAgileBoard', 'name of the agile board')

        .value('version', '0.1')
        .value('redmineKey', 'your redmine key')
        .value('gitlabToken', 'your gitlab private token')
        .value('jenkinsToken', 'your jenkins private token')
        .value('redmineUri', 'your redmine URI with trailing slash')
        .value('hallLength', 3)
        //defines how long pagination should be done before quitting
        .value('maxRecursiveCalls', 200)
        .factory('projectUri', ['redmineUri', function(redmineUri) {
             return redmineUri + '/projects/filestube/';
        }])
        .value('groupId', 19)
        .value('gitlabProjectId', 953)
        .value('gitlabUri', 'https://git.i.red-sky.pl/')
        .factory('gitlabProjectUri', ['gitlabUri', 'gitlabProjectId', function(gitlabUri, gitlabProjectId) {
            return gitlabUri + 'api/v3/projects/' + gitlabProjectId + '/';
        }])
        .value('jenkinsUri', 'http://jenkins.i.red-sky.pl/')
        .factory('jenkinsProjectUri', ['jenkinsUri', function(jenkinsUri) {
            return jenkinsUri + 'job/TubeSter-Deploy-Testing/lastBuild/api/json';
        }])

        .factory('Versions', ['$resource', 'projectUri', 'redmineKey', function ($resource, projectUri, redmineKey) {
            return $resource(projectUri + 'versions.json', {key: redmineKey});
        }])
        ;
})();
