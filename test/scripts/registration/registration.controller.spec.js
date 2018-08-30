describe('Registration Controller should', function () {
    beforeEach(module('openTrapp.registration'));

    var $controller;
    var currentDateString = "2014/01/02";
    var employeeUsername = 'homer.simpson';
    var scope, httpBackend, worklog, timeout, definedLogs;

    beforeEach(inject(function (_$controller_, $rootScope, $httpBackend, _currentEmployee_, _timeProvider_, $sce, _worklog_, $timeout, _definedLogs_) {
        $controller = _$controller_;
        scope = $rootScope.$new();
        worklog = _worklog_;
        timeout = $timeout;
        definedLogs = _definedLogs_;
        spyOn(_timeProvider_, 'getCurrentDate').and.returnValue(new Date(currentDateString));
        spyOn(_timeProvider_, 'moment').and.returnValue(moment(currentDateString, 'YYYY-MM-DD'));
        httpBackend = $httpBackend;
        spyOn(_currentEmployee_, 'username').and.returnValue(employeeUsername);
        spyOn(worklog, 'refresh');
        spyOn($sce, 'trustAsHtml').and.callFake(function (x) {
            return x;
        });
        spyOn(definedLogs, 'addLog');
        
    }));

    it('logs work to server and refreshes worklog', function () {
        var controller = newRegistrationController();
        userTypes('2h #ProjectManhattan @2014/01/03');
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
        userTypes('2h #ProjectManhattan #ProjectAlfa @2014/01/03');
        httpBackend.expectPOST("http://localhost:8080/endpoints/v1/employee/homer.simpson/work-log/entries", {
            projectNames: ['ProjectManhattan', 'ProjectAlfa'],
            workload: '2h',
            day: '2014/01/03'
        }).respond(200);

        controller.logWork();
        httpBackend.flush();

        expect(worklog.projects).toEqual({
            ProjectManhattan: { active: true },
            ProjectAlfa: { active: true }
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
        userTypes('invalid');

        controller.logWork();

        httpBackend.verifyNoOutstandingExpectation();
    });

    it('clear input after successful submit', function () {
        var controller = newRegistrationController();
        userTypes('2h #ProjectManhattan @2014/01/03');
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
        userTypes('1d 2h 5m #ProjectManhattan');
        controller.alert = { type: 'success', message: '1' };
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
        userTypes('1d 2h 5m #ProjectManhattan #Apollo');
        controller.alert = { type: 'success', message: '1' };
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
        userTypes('2h #ProjectManhattan @2014/01/03');
        controller.alert = { type: 'success', message: '1' };
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
        userTypes('2h #ProjectManhattan @2014/01/03');
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
        userTypes('invalid');

        controller.logWork();

        httpBackend.verifyNoOutstandingExpectation();
    });

    it('does not log work to server if invalid date', function () {
        var controller = newRegistrationController();
        userTypes('2h #ProjectManhattan @invalid');

        controller.logWork();

        httpBackend.verifyNoOutstandingExpectation();
    });

    it('set value of worklog field when defined log is choosen', function () {
        var controller = newRegistrationController();
        controller.setLog('2h #ProjectManhattan @today');

        expect(scope.workLogExpression).toEqual(
            '2h #ProjectManhattan @today'
        );
    });

    it('not add log to defined logs when plus button is clicked and status is "error"', function () {
        var controller = newRegistrationController();

        userTypes('not valid');

        controller.addLog();

        expect(definedLogs.addLog).not.toHaveBeenCalled();
    });

    it('not add log to defined logs when plus button is clicked and log is empty', function () {
        var controller = newRegistrationController();

        userTypes('');

        controller.addLog();

        expect(definedLogs.addLog).not.toHaveBeenCalled();
    });

    it('add log to defined logs when plus button is clicked', function () {
        var controller = newRegistrationController();

        userTypes('1h #projects');

        controller.addLog();

        expect(definedLogs.addLog).toHaveBeenCalledWith('1h #projects');
    });

    it('converts range of dates description to array of dates', function () {
        var controller = newRegistrationController();

        expect(
            controller
            .getDatesArray('@2018/07/01', '@2018/07/05')
        ).toEqual(['2018/07/02', '2018/07/03', '2018/07/04', '2018/07/05']);
    });

    it('make a range report when range expression is used', function() {
        var controller = newRegistrationController();

        userTypes('1d #vacations @2018/07/01~@2018/07/03');

        httpBackend.expectPOST("http://localhost:8080/endpoints/v1/employee/homer.simpson/work-log/entries", {
            projectNames: ['vacations'],
            workload: '1d',
            day: '2018/07/02'
        }).respond(200);

        httpBackend.expectPOST("http://localhost:8080/endpoints/v1/employee/homer.simpson/work-log/entries", {
            projectNames: ['vacations'],
            workload: '1d',
            day: '2018/07/03'
        }).respond(200);

        controller.logWork();
        httpBackend.flush();

        expect(scope.workLogExpression).toEqual("");
    });

    it('make a report on weekend', function() {
        var controller = newRegistrationController();

        userTypes('1d #vacations @2018/07/01');

        httpBackend.expectPOST("http://localhost:8080/endpoints/v1/employee/homer.simpson/work-log/entries", {
            projectNames: ['vacations'],
            workload: '1d',
            day: '2018/07/01'
        }).respond(200);

        controller.logWork();
        httpBackend.flush();

        expect(scope.workLogExpression).toEqual("");
    });

    it('set date when new date string is provided', function() {
        var controller = newRegistrationController();

        userTypes('1d #vacations @2018/07/01');

        controller.setDate('@2017/07/02~@2018/08/24');

        expect(scope.workLogExpression).toEqual("1d #vacations @2017/07/02~@2018/08/24");
    });


    describe('status', function () {

        var controller;

        beforeEach(function () {
            controller = newRegistrationController();
        });

        it('shows success feedback if expression is valid', function () {

            userTypes('#projects #ProjectManhattan @yesterday 5h');

            expect(controller.status).toBe('success');
        });

        it('shows success feedback if range expression is valid', function () {

            userTypes('2h #ProjectManhattan @2014/01/03~@2014/01/20');

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

        it('shows error feedback if range expression is not valid', function () {

            userTypes('2h #ProjectManhattan @2014/01/03-2014/01/20');

            expect(controller.status).toBe('error');
        });

        it('shows no feedback if expression is empty', function () {

            userTypes('');

            expect(controller.status).toBe('');
        });

        

    });

    function newRegistrationController() {
        return $controller('RegistrationController', {
            $scope: scope
        });
    }

    function userTypes(input) {
        scope.workLogExpression = input;
        scope.$digest();
    }

});
