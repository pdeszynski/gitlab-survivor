(function () {
    'use strict';
    angular.module('ftDashboard.components.login', ['ftDashboard.components.settings', 'ngResource'])
        .service('backendLogin', ['loginToYoutrack', function (loginToYoutrack) {
            return loginToYoutrack;
        }])
        .service('loginToYoutrack', [
            '$http', '$q', 'youtrackUri', 'youtrackLogin', 'youtrackPassword',
            function ($http, $q, youtrackUri, youtrackLogin, youtrackPassword) {
                var logged = null;
                return {
                    login: function () {
                        var deferred = $q.defer();
                        if (logged) {
                            deferred.resolve(logged);
                            return deferred.promise;
                        }
                        $http({
                                method: 'POST',
                                url: youtrackUri + 'rest/user/login',
                                withCredentials: true,
                                params: {
                                    login: youtrackLogin, password: youtrackPassword
                                }
                            }
                        )
                        .success(function (data, status, headers, config) {
                            logged = headers('set-cookie');
                            deferred.resolve(logged);
                        })
                        .error(function(data, status, headers, config) {
                            deferred.reject("An error occured while login to youtrack " + status);
                        });
                        return deferred.promise;
                    }
                };
            }
        ]);
})();
