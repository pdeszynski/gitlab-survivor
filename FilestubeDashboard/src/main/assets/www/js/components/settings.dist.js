(function () {
    'use strict';
    angular.module('ftDashboard.components.settings', [])
        .value('version', '0.1')

        .value('youtrackUri', 'Your YoutrackUri with trailing slash')
        .value('youtrackLogin', 'your youtrack login with admin rights')
        .value('youtrackPassword', 'your password')
        .value('youtrackProjectId', 'your youtrack project ID')
        .value('youtrackUserRole', 'youtrack user role to be tracked in hall')
        .value('youtrackAgileBoard', 'name of the agile board')

        .value('redmineKey', 'your redmine key')
        .value('redmineUri', 'your redmine URI with trailing slash')
        .factory('projectUri', ['redmineUri', function(redmineUri) {
             return redmineUri + '/projects/[your project name in a redmine]/';
        }])
        //redmine group id
        .value('groupId', 19)

        .value('gitlabProjectId', 953)
        .value('gitlabToken', 'your gitlab private token')
        .value('gitlabUri', 'your gitlab URI with a trailing slash')
        .factory('gitlabProjectUri', ['gitlabUri', 'gitlabProjectId', function(gitlabUri, gitlabProjectId) {
            return gitlabUri + 'api/v3/projects/' + gitlabProjectId + '/';
        }])

        .value('jenkinsToken', 'your jenkins private token')
        .value('jenkinsUri', 'Your jenkins URI with a trailing slash')
        .factory('jenkinsProjectUri', ['jenkinsUri', function(jenkinsUri) {
            return jenkinsUri + 'job/<your project name>/lastBuild/api/json';
        }])

        .factory('Versions', ['$resource', 'projectUri', 'redmineKey', function ($resource, projectUri, redmineKey) {
            return $resource(projectUri + 'versions.json', {key: redmineKey});
        }])

        .value('hallLength', 3)
        //defines how long pagination should be done before quitting
        .value('maxRecursiveCalls', 200)
        ;
})();
