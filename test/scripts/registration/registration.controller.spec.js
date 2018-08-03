describe('Registration Controller should', function () {
    beforeEach(module('openTrapp.registration'));

    var $controller;
    var currentDateString = "2014/01/02";
    var employeeUsername = 'homer.simpson';
    var scope, httpBackend, worklog, timeout;

    beforeEach(inject(function (_$controller_, $rootScope, $httpBackend, _currentEmployee_, _timeProvider_, $sce, _worklog_, $timeout) {
        $controller = _$controller_;
        scope = $rootScope.$new();
        worklog = _worklog_;
        timeout = $timeout;
        spyOn(_timeProvider_, 'getCurrentDate').and.returnValue(new Date(currentDateString));
        spyOn(_timeProvider_, 'moment').and.returnValue(moment(currentDateString, 'YYYY-MM-DD'));
        httpBackend = $httpBackend;
        spyOn(_currentEmployee_, 'username').and.returnValue(employeeUsername);
        spyOn(worklog, 'refresh');
        spyOn($sce, 'trustAsHtml').and.callFake(function (x) {
            return x;
        });
    }));

    it('logs work to server and refreshes worklog', function () {
        var controller = newRegistrationController();
        scope.workLogExpression = '2h #ProjectManhattan @2014/01/03';
        httpBackend.expectPOST("http://localhost:8080/endpoints/v1/employee/homer.simpson/work-log/entries", {
            projectNames: ['ProjectManhattan'],
            workload: '2h',
            day: '2014/01/03'
        }).respond(200);

        controller.logWork();
        httpBackend.flush();

        expect(worklog.refresh).toHaveBeenCalled();
    });

    it('enables new projects when logging work', function () {
        var controller = newRegistrationController();
        scope.workLogExpression = '2h #ProjectManhattan #ProjectAlfa @2014/01/03';
        httpBackend.expectPOST("http://localhost:8080/endpoints/v1/employee/homer.simpson/work-log/entries", {
            projectNames: ['ProjectManhattan', 'ProjectAlfa'],
            workload: '2h',
            day: '2014/01/03'
        }).respond(200);

        controller.logWork();
        httpBackend.flush();

        expect(worklog.projects).toEqual({
            ProjectManhattan : {active : true},
            ProjectAlfa : {active : true}
        });
    });

    it("initializes workload with current month", function () {
        httpBackend.expectGET("http://localhost:8080/endpoints/v1/calendar/2014/01/work-log/entries").respond(200);

        newRegistrationController();

        timeout.flush();
        httpBackend.flush();
    });

    it('be invalid when date is not a proper format', function () {
        var controller = newRegistrationController();
        scope.workLogExpression = 'invalid';

        controller.logWork();

        httpBackend.verifyNoOutstandingExpectation();
    });

    it('clear input after successful submit', function () {
        var controller = newRegistrationController();
        scope.workLogExpression = '2h #ProjectManhattan @2014/01/03';
        httpBackend.expectPOST("http://localhost:8080/endpoints/v1/employee/homer.simpson/work-log/entries", {
            projectNames: ['ProjectManhattan'],
            workload: '2h',
            day: '2014/01/03'
        }).respond(200);

        controller.logWork();
        httpBackend.flush();

        expect(scope.workLogExpression).toBe('');
    });

    it('show successful alert with actual data', function () {
        var controller = newRegistrationController();
        scope.workLogExpression = '1d 2h 5m #ProjectManhattan';
        controller.alert = {type: 'success', message: '1'};
        httpBackend.expectPOST().respond(200);

        controller.logWork();
        httpBackend.flush();

        expect(controller.alerts).toContain({
            type: 'success',
            message: '<b>Hurray!</b> You  have successfully logged <b>1d 2h 5m</b> on <b>ProjectManhattan</b> on <b>' + currentDateString + '</b>.'
        });
    });

    it('show successful alert with multiple projets', function () {
        var controller = newRegistrationController();
        scope.workLogExpression = '1d 2h 5m #ProjectManhattan #Apollo';
        controller.alert = {type: 'success', message: '1'};
        httpBackend.expectPOST().respond(200);

        controller.logWork();
        httpBackend.flush();

        expect(controller.alerts).toContain({
            type: 'success',
            message: '<b>Hurray!</b> You  have successfully logged <b>1d 2h 5m</b> on <b>ProjectManhattan</b>,<b>Apollo</b> on <b>' + currentDateString + '</b>.'
        });
    });

    it('replace alert on second request', function () {
        var controller = newRegistrationController();
        scope.workLogExpression = '2h #ProjectManhattan @2014/01/03';
        controller.alert = {type: 'success', message: '1'};
        httpBackend.expectPOST().respond(200);

        controller.logWork();
        httpBackend.flush();

        expect(controller.alerts).toContain({
            type: 'success',
            message: '<b>Hurray!</b> You  have successfully logged <b>2h</b> on <b>ProjectManhattan</b> on <b>2014/01/03</b>.'
        });
    });

    it('display feedback to user in case of failed request', function () {
        var controller = newRegistrationController();
        scope.workLogExpression = '2h #ProjectManhattan @2014/01/03';
        httpBackend.expectPOST().respond(503);

        controller.logWork();
        httpBackend.flush();

        expect(controller.alerts).toContain({
            type: 'danger',
            message: '<b>Oops...</b> Server is not responding.'
        });
    });

    it('does not log work to server if invalid expression', function () {
        var controller = newRegistrationController();
        scope.workLogExpression = 'invalid';

        controller.logWork();

        httpBackend.verifyNoOutstandingExpectation();
    });

    it('does not log work to server if invalid date', function () {
        var controller = newRegistrationController();
        scope.workLogExpression = '2h #ProjectManhattan @invalid';

        controller.logWork();

        httpBackend.verifyNoOutstandingExpectation();
    });

    describe('status', function () {

        var controller;

        beforeEach(function () {
            controller = newRegistrationController();
        });

        it('shows success fedback if expression is valid', function () {

            userTypes('2h #ProjectManhattan @2014/01/03');

            expect(controller.status).toBe('success');
        });

        it('be valid for worklog without date', function () {

            userTypes('2h #ProjectManhattan');

            expect(controller.status).toBe('success');
        });

        it('shows error fedback if expression is not valid', function () {

            userTypes('not valid');

            expect(controller.status).toBe('error');
        });

        it('shows no fedback if expression is empty', function () {

            userTypes('');

            expect(controller.status).toBe('');
        });

        function userTypes(input) {
            scope.workLogExpression = input;
            scope.$digest();
        }

    });

    function newRegistrationController() {
        return $controller('RegistrationController', {
            $scope: scope
        });
    }

});
