'use strict';


// Declare app level module which depends on filters, and services
angular.module('ftDashboard', [
    'ftDashboard.filters',
    'ftDashboard.services',
    'ftDashboard.directives',
    'ftDashboard.controllers',
    'ngResource',
    'ngRoute'
  ]).
  config(['$routeProvider', function($routeProvider) {
    $routeProvider.when('/', {templateUrl: 'partials/index.html', controller: 'Index'});
    //$routeProvider.when('/view2', {templateUrl: 'partials/partial2.html', controller: 'MyCtrl2'});
    $routeProvider.otherwise({redirectTo: '/'});
  }]);
