'use strict';

/* Services */


// Demonstrate how to register services
// In this case it is a simple value service.
angular.module('ftDashboard.services', ['ftDashboard.components.settings'])
    .value('version', '0.1')

    /**
     * Group users from redmine
     * @deprecated
     */
    .factory('GroupUsers', ['$resource', 'redmineUri', 'redmineKey', 'groupId', function($resource, redmineUri, redmineKey, groupId) {
        return $resource(redmineUri + 'users.json', {key: redmineKey});
    }])

    /**
     * Hall generated from gitlab issues list
     * @deprecated
     *
     */
    .factory('hall', [function() {

        var keyUsers = function(users) {
            var usersKeyed = {};
            angular.forEach(users, function (user) {
                user.issues_solved = 0;
                usersKeyed[user.id] = user;
            });

            return usersKeyed;
        };
        return function(issues, users) {
            users = keyUsers(users.users);
            angular.forEach(issues, function(issue) {
                if (issue.assigned_to && /Closed|Rejected/.test(issue.status.name)) {
                    users[issue.assigned_to.id].issues_solved++;
                }
            });
            return users;
        };
    }])
    ;
