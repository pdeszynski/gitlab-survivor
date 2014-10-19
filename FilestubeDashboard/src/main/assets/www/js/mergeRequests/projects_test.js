/* global beforeEach, afterEach, angular, describe, inject, expect, it, module, spyOn */
'use strict';

describe('ftDashboard.mergeRequests.projects module', function() {
    var $httpBackend, q, provider;
    beforeEach(module('ftDashboard.mergeRequests.projects', function ($provide) {
        provider = $provide;
        provider.value('gitlabProjectId', [1]);
    }));

    beforeEach(function () {
        angular.mock.inject(function ($injector) {
            $httpBackend = $injector.get('$httpBackend');
        });
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
        $httpBackend.resetExpectations();
    });

    describe('projects service', function() {
        it('should return an implementation', inject(function(projects) {
            expect(projects).toBeDefined();
            expect(projects.get).toBeDefined();
        }));

        it('should return model for a project when used gitlab implementation', inject(function (projects, projectsGitlab){
            spyOn(projectsGitlab, 'get').and.returnValue({
                someProject: 'name'
            });
            var value = projects.get();
            expect(value).toEqual({someProject: 'name'});
        }));

    });

    describe('projectsGitlab service', function () {
        it('should return a model of a project when get is called', inject(function (projectsGitlab, gitlabProjectId) {
            var response = {id: gitlabProjectId, name: 'some project'};
            $httpBackend.expectGET()
                .respond(response);

            var result = projectsGitlab.get();
            result.then(function (value) {
                //check whether it's the requested interface
                expect(value.length).toBe(1);
                var current = value.pop();
                expect(current.getName).toBeDefined();
                expect(current.getId).toBeDefined();
                expect(current).toEqual(response);
            });

            $httpBackend.flush();
        }));
    });

    describe('projectsGitlab service multiple projects', function () {
        beforeEach(inject(function () {
            provider.value('gitlabProjectId', [1, 2, 3]);
        }));
        it ('should be able to handle array of project ids', inject(function (gitlabProjectId, projectsGitlab) {
            var expectedProjects = [
                {id: gitlabProjectId[0], name: 'first'},
                {id: gitlabProjectId[1], name: 'second'},
                {id: gitlabProjectId[2], name: 'third'}
            ];
            $httpBackend.expectGET()
                .respond(expectedProjects[0]);
            $httpBackend.expectGET()
                .respond(expectedProjects[1]);
            $httpBackend.expectGET()
                .respond(expectedProjects[2]);

            var promise = projectsGitlab.get();
            promise
                .then(function (value) {
                    expect(value).toEqual(expectedProjects);
                    angular.forEach(value, function (project) {
                        expect(project.getName).toBeDefined();
                        expect(project.getId).toBeDefined();
                    });
                });

            $httpBackend.flush();
        }));
    });
});
