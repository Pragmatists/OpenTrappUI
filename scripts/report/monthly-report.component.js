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

                    var firstDay = moment(new Date(currentMonth)).startOf('month').format("DD-MM-YYYY");
                    var lastDay = moment(new Date(currentMonth)).endOf('month').format("DD-MM-YYYY");

                    var holidaysPromise = $http.get('http://kayaposoft.com/enrico/json/v1.0/?action=getPublicHolidaysForDateRange&fromDate=' + firstDay + '&toDate=' + lastDay + '&country=pol');
                    
                    var holidays = [];

                    holidaysPromise.then(function(result) {
                        holidays = result.data.map(function(holiday) {
                            var formatDate = moment(new Date(holiday.date.year + "/" + holiday.date.month + "/" + holiday.date.day)).format('YYYY/MM/DD');
                            return formatDate;
                        })

                        var isHoliday = function(day) {
                            for(var i = 0; i < holidays.length; i++) {
                                if(day._i === holidays[i])
                                    return true;
                            }
    
                            return false;
                        }
    
                        self.days = _(data.days).map(function (d) {
    
                            var m = moment(d.id, 'YYYY/MM/DD');
    
                            return {
                                id: d.id,
                                number: m.format('DD'),
                                name: m.format('ddd'),
                                weekend: d.holiday,
                                ifPastMonth: m.startOf('month') < moment().startOf('month'),
                                holiday: isHoliday(m)
                            }
                        }).value();
                    });

                    
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