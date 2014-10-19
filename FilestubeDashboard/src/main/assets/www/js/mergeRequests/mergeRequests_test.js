/* global beforeEach, angular, describe, inject, expect, it, module */
'use strict';

describe('ftDashboard.mergeRequests.mergeRequests module', function() {
    var $httpBackend, projectsMock, provider, projectsDefer;
    beforeEach(module('ftDashboard.mergeRequests.mergeRequests', function ($provide) {
        provider = $provide;
    }));

    beforeEach(function () {
        angular.mock.inject(function ($injector, $q) {
            projectsDefer = $q.defer();
            $httpBackend = $injector.get('$httpBackend');
            projectsMock = {
                get: function () {
                    return projectsDefer.promise;
                }
            };
            provider.value('projects', projectsMock);
        });
    });

    describe('mergeRequests service', function() {
        it('should return an implementation with get method', inject(function(mergeRequests) {
            expect(mergeRequests.get).toBeDefined();
        }));

        it('should return number of opened merge requests', inject(function (mergeRequests) {
            $httpBackend.expectGET()
                .respond([
                    {state: 'opened'},
                    {state: 'opened'}
                ]);
            var result = mergeRequests.get();

            projectsDefer.resolve([{
                getName: function () {return 'test';},
                getId: function () {return 1;}
            }]);

            result.then(function (openedCount) {
                expect(openedCount).toEqual([{ projectName: 'test', count: 2 }]);
            });
            $httpBackend.flush();
        }));
    });
});
