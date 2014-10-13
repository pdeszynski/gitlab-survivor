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
             return redmineUri + '/projects/[your project name in a redmine]/';
        }])
        .value('groupId', 19)
        .value('gitlabProjectId', 953)
        .value('gitlabUri', 'your gitlab URI with a trailing slash')
        .factory('gitlabProjectUri', ['gitlabUri', 'gitlabProjectId', function(gitlabUri, gitlabProjectId) {
            return gitlabUri + 'api/v3/projects/' + gitlabProjectId + '/';
        }])
        .value('jenkinsUri', 'Your jenkins URI with a trailing slash')
        .factory('jenkinsProjectUri', ['jenkinsUri', function(jenkinsUri) {
            return jenkinsUri + 'job/<your project name>/lastBuild/api/json';
        }])

        .factory('Versions', ['$resource', 'projectUri', 'redmineKey', function ($resource, projectUri, redmineKey) {
            return $resource(projectUri + 'versions.json', {key: redmineKey});
        }])
        ;
})();
