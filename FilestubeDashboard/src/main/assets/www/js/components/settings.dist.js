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
        /**
         * If instead of only finished tasks you want to add also burned points then
         * fill this value, if not, it should be null. You should put here exact
         * name of estimated story points field (with spaces and correct letter case)
         *
         * {String} Name of a field or null if tracking disabled
         */
        .value('youtrackEstimationField', "Estimated story points field name")

        .value('gitlabProjectId', ['an array', 'of', 'your gitlab project ID'])
        .value('gitlabToken', 'your gitlab private token')
        .value('gitlabUri', 'your gitlab URI with a trailing slash')
        //TODO: cleanup all usages of this URI, pass gitlabUri and project id instead
        .factory('gitlabProjectUri', ['gitlabUri', 'gitlabProjectId', function(gitlabUri, gitlabProjectId) {
            return gitlabUri + 'api/v3/projects/' + gitlabProjectId + '/';
        }])

        .value('jenkinsToken', 'your jenkins private token')
        .value('jenkinsUri', 'Your jenkins URI with a trailing slash')
        .factory('jenkinsProjectUri', ['jenkinsUri', function(jenkinsUri) {
            return jenkinsUri + 'job/<your project name>/lastBuild/api/json';
        }])

        //if you're using remine as a issues backend, then this should be filled
        .value('redmineKey', 'your redmine key')
        .value('redmineUri', 'your redmine URI with trailing slash')
        .factory('projectUri', ['redmineUri', function(redmineUri) {
             return redmineUri + '/projects/[your project name in a redmine]/';
        }])
        //redmine group id
        .value('groupId', 'your group ID (integer) containing users')
        .factory('Versions', ['$resource', 'projectUri', 'redmineKey', function ($resource, projectUri, redmineKey) {
            return $resource(projectUri + 'versions.json', {key: redmineKey});
        }])

        /*
         * General app settings, independent to backends, but might be used
         * by them as well.
         *
         */
        .value('hallLength', 3)
        //defines how long pagination should be done before quitting
        //you should use this value in your services if you want to implement
        //recursive calls for data
        .value('maxRecursiveCalls', 200)
        ;
})();
