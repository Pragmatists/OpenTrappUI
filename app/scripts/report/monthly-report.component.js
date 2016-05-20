(function () {

    angular
        .module('openTrapp.report')
        .component('otMonthlyReport', {
            templateUrl: 'templates/report/monthly-report.component.html',
            controller: MonthlyReportController,
            controllerAs: 'viewModel',
            bindings: {
                'forCurrentEmployee': '<'
            }
        });

    function MonthlyReportController($http, worklog, workloadReports, currentEmployee) {
        var self = this;

        self.isForOneEmployee = isForOneEmployee;
        self.days = [];
        self.report = {};

        var currentMonth = null;

        worklog.onUpdate(function () {
            fetchDays();
            calculateDays();
        });

        function isForOneEmployee() {
            return self.forCurrentEmployee;
        }

        function fetchDays() {
            if (currentMonth && currentMonth.valueOf() === worklog.month.valueOf()) {
                return;
            } else {
                currentMonth = worklog.month;
            }
            $http.get('http://localhost:8080/endpoints/v1/calendar/' + worklog.month).success(function (data) {
                self.days = _(data.days).map(function (d) {

                    var m = moment(d.id, 'YYYY/MM/DD');

                    return {
                        id: d.id,
                        number: m.format('DD'),
                        name: m.format('ddd'),
                        holiday: d.holiday
                    }
                }).value();
            });
        }

        function calculateDays() {
            self.report = workloadReports.newReport();
            _(worklog.entries)
                .filter(function (worklogEntry) {
                    return self.forCurrentEmployee
                        ? worklogEntry.employee === currentEmployee.username()
                        : true;
                })
                .forEach(function (worklogEntry) {
                    self.report.updateWorkload(worklogEntry);
                });
            self.report.roundToHours();
        }

    }

})();