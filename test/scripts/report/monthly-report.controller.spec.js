describe('MonthlyReportController', function () {

    var $httpBackend, $rootScope, $componentController;
    var worklog, worklogUpdated;

    beforeEach(module('openTrapp.report'));

    beforeEach(inject(function (_$rootScope_, _$componentController_, _$httpBackend_) {
        $rootScope = _$rootScope_;
        $componentController = _$componentController_;
        $httpBackend = _$httpBackend_;

        
    }));

    beforeEach(function () {
        worklogUpdated = function () { };
        worklog = {
            month: '2014/01',
            projects: {},
            onUpdate: function (callback) {
                worklogUpdated = callback;
            },
            hasMonthSet: function () {
                return !!this.month;
            }
        };

        
    });

    it('fetches days in given month', function () {
        // given:

        $httpBackend
            .whenGET('http://localhost:8080/endpoints/v1/calendar/' + '2018/07')
            .respond(200, {
                days: [{ id: '2018/07/01', holiday: false }, { id: '2018/07/02', holiday: true }]
            });

        // when:
        var controller = newMonthlyReportController({ displayMonth: '2018/07' });

        $httpBackend
            .whenGET('http://kayaposoft.com/enrico/json/v1.0/?action=getPublicHolidaysForDateRange&fromDate=01-07-2018&toDate=31-07-2018&country=pol')
            .respond(200, []);

        $httpBackend.flush();



        // then:
        expect(controller.days)
            .toEqual([
                { id: '2018/07/01', number: "01", name: "Sun", weekend: false, ifPastMonth: true, holiday: false },
                { id: '2018/07/02', number: "02", name: "Mon", weekend: true, ifPastMonth: true, holiday: false }
            ]);

    });

    it('fetches days in worklog month when no month provided', function () {
        // given:
        $httpBackend
            .whenGET('http://localhost:8080/endpoints/v1/calendar/' + '2014/01')
            .respond(200, {
                days: [{ id: '2014/01/01', holiday: false }, { id: '2014/01/02', holiday: true }]
            });

        // when:
        var controller = newMonthlyReportController({});

        $httpBackend
            .whenGET('http://kayaposoft.com/enrico/json/v1.0/?action=getPublicHolidaysForDateRange&fromDate=01-01-2014&toDate=31-01-2014&country=pol')
            .respond(200, []);

        $httpBackend.flush();

        // then:
        expect(controller.days)
            .toEqual([
                { id: '2014/01/01', number: '01', name: 'Wed', weekend: false, ifPastMonth: true, holiday: false },
                { id: '2014/01/02', number: '02', name: 'Thu', weekend: true, ifPastMonth: true, holiday: false }
            ]);

    });

    it("calculates every day totals for every employee", function () {

        // given:
        worklog.entries = [
            {
                day: "2014/01/01",
                employee: "bart.simpson",
                workload: "1h"
            },
            {
                day: "2014/01/01",
                employee: "bart.simpson",
                workload: "2h 30m"
            },
            {
                day: "2014/01/02",
                employee: "bart.simpson",
                workload: "3h"
            },
            {
                day: "2014/01/02",
                employee: "homer.simpson",
                workload: "4h 20m"
            }
        ];

        // when:
        var controller = newMonthlyReportController({});

        // then:
        expect(controller.report.employees())
            .toEqual({
                "bart.simpson": { "2014/01/01": "3.5", "2014/01/02": "3", "total": "6.5" },
                "homer.simpson": { "2014/01/02": "4.33", "total": "4.33" }
            });
        expect(controller.report.total())
            .toEqual({ "2014/01/01": "3.5", "2014/01/02": "7.33", "total": "10.83" });
    });

    it("calculates total when workloads are non-positive", function () {

        // given:
        worklog.entries = [
            {
                day: "2014/01/02",
                employee: "bart.simpson",
                workload: "2h 30m"
            },
            {
                day: "2014/01/02",
                employee: "bart.simpson",
                workload: ""
            }
        ];

        // when:
        var controller = newMonthlyReportController({});

        // then:
        expect(controller.report.total())
            .toEqual({ "2014/01/02": "2.5", "total": "2.5" });
    });

    it("rounds to hours only once", function () {
        worklog.entries = [
            {
                day: "2014/01/01",
                employee: "bart.simpson",
                workload: "1h"
            }
        ];

        // when:
        var controller = newMonthlyReportController({});
        controller.report.employees();

        // then:
        expect(controller.report.employees()).toEqual({
            "bart.simpson": { "2014/01/01": "1", "total": "1" }
        });
    });

    it("recreates report on worklog update", function () {
        // given
        worklog.entries = [];
        var controller = newMonthlyReportController({});

        // when:
        worklog.entries = [
            {
                day: "2014/01/01",
                employee: "bart.simpson",
                workload: "1h"
            }
        ];
        worklogUpdated();

        // then:
        expect(controller.report.employees()).toEqual({
            "bart.simpson": { "2014/01/01": "1", "total": "1" }
        });
    });

    it("sets 'from' and 'to' dates when dates on report are selected", function () {

        var controller = newMonthlyReportController({ displayMonth: '2018/07', forCurrentEmployee: true, setDate: function () { } });

        controller.selectDay(1, { shiftKey: false });

        expect(controller.selectedDates.from.isSame(moment(new Date("2018/07/01")))).toBeTruthy();
        expect(controller.selectedDates.to.isSame(moment(new Date("2018/07/01")))).toBeTruthy();
    });

    it("says whether day is highlighted", function () {
        var controller = newMonthlyReportController({ displayMonth: '2018/07', forCurrentEmployee: true, setDate: function () { } });

        controller.selectDay(1, { shiftKey: false });

        expect(controller.isHighlighted(1)).toBeTruthy();
        expect(controller.isHighlighted(2)).toBeFalsy();
    });

    describe("sets date on worklog expression", function () {
        it("when nothing had been selected", function () {
            var setDateMock = jasmine.createSpy('setDate');
            var controller = newMonthlyReportController({ displayMonth: '2018/07', forCurrentEmployee: true, setDate: setDateMock });

            controller.selectDay(1, { shiftKey: false });

            expect(setDateMock).toHaveBeenCalledWith("@2018/07/01");
        });

        it("when date had been selected", function () {
            var setDateMock = jasmine.createSpy('setDate');
            var controller = newMonthlyReportController({ displayMonth: '2018/07', forCurrentEmployee: true, setDate: setDateMock });

            controller.selectDay(2, { shiftKey: false });

            expect(setDateMock).toHaveBeenCalledWith("@2018/07/02");

            controller.selectDay(1, { shiftKey: false });

            expect(setDateMock).toHaveBeenCalledWith("@2018/07/01");
        });

        it("when range of dates had been selected", function () {
            var setDateMock = jasmine.createSpy('setDate');
            var controller = newMonthlyReportController({ displayMonth: '2018/07', forCurrentEmployee: true, setDate: setDateMock });

            controller.selectDay(1, { shiftKey: false });
            expect(setDateMock).toHaveBeenCalledWith("@2018/07/01");
            controller.selectDay(15, { shiftKey: true });

            expect(setDateMock).toHaveBeenCalledWith("@2018/07/01~@2018/07/15");

            controller.selectDay(1, { shiftKey: false });

            expect(setDateMock).toHaveBeenCalledWith("@2018/07/01");
        });
    });

    describe("sets range of dates on worklog expression", function () {
        it("when nothing had been selected", function () {
            var setDateMock = jasmine.createSpy('setDate');
            var controller = newMonthlyReportController({ displayMonth: '2018/07', forCurrentEmployee: true, setDate: setDateMock });

            controller.selectDay(1, { shiftKey: false });
            controller.selectDay(15, { shiftKey: true });

            expect(setDateMock).toHaveBeenCalledWith("@2018/07/01~@2018/07/15");
        });

        it("when date had been selected", function () {
            var setDateMock = jasmine.createSpy('setDate');
            var controller = newMonthlyReportController({ displayMonth: '2018/07', forCurrentEmployee: true, setDate: setDateMock });

            controller.selectDay(2, { shiftKey: false });

            expect(setDateMock).toHaveBeenCalledWith("@2018/07/02");

            controller.selectDay(1, { shiftKey: false });
            controller.selectDay(15, { shiftKey: true });

            expect(setDateMock).toHaveBeenCalledWith("@2018/07/01~@2018/07/15");
        });

        it("when range of dates had been selected", function () {
            var setDateMock = jasmine.createSpy('setDate');
            var controller = newMonthlyReportController({ displayMonth: '2018/07', forCurrentEmployee: true, setDate: setDateMock });

            controller.selectDay(1, { shiftKey: false });
            expect(setDateMock).toHaveBeenCalledWith("@2018/07/01");
            controller.selectDay(15, { shiftKey: true });

            expect(setDateMock).toHaveBeenCalledWith("@2018/07/01~@2018/07/15");

            controller.selectDay(3, { shiftKey: false });
            controller.selectDay(18, { shiftKey: true });

            expect(setDateMock).toHaveBeenCalledWith("@2018/07/03~@2018/07/18");
        });
    });


    function newMonthlyReportController(bindings) {
        return $componentController(
            'otMonthlyReport',
            {
                $scope: $rootScope.$new(),
                worklog: worklog
            },
            bindings
        );
    }


});