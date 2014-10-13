(function(){
    'use strict';
    angular.module('ftDashboard.hall.users', ['ngResource', 'ftDashboard.components.settings'])
        .factory('users', ['usersYoutrack', function (implementation) {
            return implementation;
        }])
        .factory('usersYoutrack', [
            '$resource', 'youtrackUri', 'youtrackProjectId', 'youtrackUserRole',
            function ($resource, youtrackUri, youtrackProjectId, youtrackUserRole) {
                var Users = $resource(youtrackUri + 'rest/admin/user', {
                    project: youtrackProjectId
                }, {
                    get: {method: 'GET', isArray: true}
                });
                return {
                    get: function () {
                        var params = youtrackUserRole ? {role: youtrackUserRole} : {};
                        return Users.get(params).$promise;
                    }
                };
        }])
        ;
})();
