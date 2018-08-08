(function () {

    angular
        .module('openTrapp.report')
        .component('otMonthlyReport', {
            templateUrl: 'templates/report/monthly-report.component.html',
            controller: MonthlyReportController,
            controllerAs: 'viewModel',
            bindings: {
                'forCurrentEmployee': '<',
                'displayMonth': '<'
            }
        });

    function MonthlyReportController($http, worklog, workloadReports, currentEmployee) {
        var self = this;

        self.isForOneEmployee = isForOneEmployee;
        self.days = [];
        self.report = {};

        var currentMonth = null;

        recreateReport();
        worklog.onUpdate(recreateReport);

        function recreateReport() {
            if (worklog.hasMonthSet()) {
                fetchDays();
                calculateDays();
            }
        }

        function isForOneEmployee() {
            return self.forCurrentEmployee;
        }

        function month() {
            return self.displayMonth ? self.displayMonth : worklog.month
        }

        function fetchDays() {
            if (currentMonth && currentMonth === month()) {
                return;
            } else {
                currentMonth = month();
            }
            $http.get('http://localhost:8080/endpoints/v1/calendar/' + currentMonth)
                .then(function (response) {
                    var data = response.data;
                    self.days = _(data.days).map(function (d) {

                        var m = moment(d.id, 'YYYY/MM/DD');

                        return {
                            id: d.id,
                            number: m.format('DD'),
                            name: m.format('ddd'),
                            holiday: d.holiday,
                            ifPastMonth: m.startOf('month') < moment().startOf('month')
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

        self.$onChanges = function (changesObj) {
            recreateReport();
        };

    }

})();