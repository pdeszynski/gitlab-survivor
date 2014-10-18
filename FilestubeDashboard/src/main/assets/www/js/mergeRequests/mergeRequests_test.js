/* global beforeEach, angular, describe, inject, expect, it, module */
'use strict';

describe('ftDashboard.mergeRequests.mergeRequests module', function() {
    var $httpBackend, q;
    beforeEach(module('ftDashboard.mergeRequests.mergeRequests'));

    beforeEach(function () {
        angular.mock.inject(function ($injector, $q) {
            $httpBackend = $injector.get('$httpBackend');
            $q = $injector.get('$q');
        });
    });

    describe('mergeRequests service', function() {
        it('should return an implementation with get method', inject(function(mergeRequests) {
            expect(mergeRequests.get).toBeDefined();
        }));

        it('should return number of opened merge requests', inject(function (mergeRequests, $q) {
            $httpBackend.expectGET()
                .respond([
                    {state: 'opened'},
                    {state: 'opened'}
                ]);
            var result = mergeRequests.get();
            result.then(function (openedCount) {
                expect(openedCount).toBe(2);
            });
            $httpBackend.flush();
        }));
    });
});
