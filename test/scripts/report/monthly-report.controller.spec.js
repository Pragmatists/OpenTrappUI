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
        worklogUpdated = function () {};
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
            .whenGET('http://localhost:8080/endpoints/v1/calendar/' + worklog.month)
            .respond(200, {
                days: [{id: '2014/01/01', holiday: false}, {id: '2014/01/02', holiday: true}]
            });

        // when:
        var controller = newMonthlyReportController();
        $httpBackend.flush();

        // then:
        expect(controller.days)
            .toEqual([
                {id: '2014/01/01', number: "01", name: "Wed", holiday: false},
                {id: '2014/01/02', number: "02", name: "Thu", holiday: true}
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
        var controller = newMonthlyReportController();

        // then:
        expect(controller.report.employees())
            .toEqual({
                "bart.simpson": {"2014/01/01": "3.5", "2014/01/02": "3", "total": "6.5"},
                "homer.simpson": {"2014/01/02": "4.33", "total": "4.33"}
            });
        expect(controller.report.total())
            .toEqual({"2014/01/01": "3.5", "2014/01/02": "7.33", "total": "10.83"});
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
        var controller = newMonthlyReportController();

        // then:
        expect(controller.report.total())
            .toEqual({"2014/01/02": "2.5", "total": "2.5"});
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
        var controller = newMonthlyReportController();
        controller.report.employees();

        // then:
        expect(controller.report.employees()).toEqual({
            "bart.simpson": {"2014/01/01": "1", "total": "1"}
        });
    });

    it("recreates report on worklog update", function () {
        // given
        worklog.entries = [];
        var controller = newMonthlyReportController();

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
            "bart.simpson": {"2014/01/01": "1", "total": "1"}
        });
    });

    function newMonthlyReportController() {
        return $componentController('otMonthlyReport', {
            $scope: $rootScope.$new(),
            worklog: worklog
        });
    }


});