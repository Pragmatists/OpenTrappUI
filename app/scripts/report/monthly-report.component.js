(function () {

    angular
        .module('openTrapp.report')
        .component('otMonthlyReport', {
            templateUrl: 'templates/report/monthly-report.component.html',
            controller: MonthlyReportController,
            controllerAs: 'viewModel',
            bindings: {
                'forCurrentEmployee': '<',
                'displayMonth': '<',
                'setDate': '=',
                'dates': '<'
            }
        });

    function MonthlyReportController($http, worklog, workloadReports, currentEmployee) {
        var self = this;

        self.isForOneEmployee = isForOneEmployee;
        self.selectDay = selectDay;
        self.days = [];
        self.report = {};
        self.isHighlighted = isHighlighted;
        self.generateTimeString = generateTimeString;
        self.getFrom = getFrom;
        self.getTo = getTo;

        var currentMonth = null;

        var SelectedDays = function() {
            var from = undefined;
            var to = undefined;


            return {
                from: from,
                to: to,
                areSame: function() {
                    return this.from.isSame(this.to);
                },
                include: function(date) {
                    return (date.isBefore(this.to) || date.isSame(this.to)) && (date.isAfter(this.from) || date.isSame(this.from))
                },
                deselect: function() {
                    this.from = undefined;
                    this.to = undefined;
                    return 0;
                },
                setOneDate: function(date) {
                    this.from = date;
                    this.to = date;
                    return 0;
                },
                setRangeOfDates: function(secondDate) {
                    this.from = secondDate.isBefore(this.from) ? secondDate : this.from;
                    this.to = secondDate.isAfter(this.to) ? secondDate : this.to;
                },
                areDefined: function() {
                    return this.from && this.to;
                }
            }
        }

        self.selectedDates = new SelectedDays();

        recreateReport();
        worklog.onUpdate(recreateReport);

        function recreateReport() {
            if (worklog.hasMonthSet()) {
                
                fetchDays();
                calculateDays();

                if(self.isForOneEmployee()) {
                    self.selectedDates.from = self.getFrom();
                    self.selectedDates.to = self.getTo();
                }

            }
        }

        function isForOneEmployee() {
            return self.forCurrentEmployee;
        }

        function month() {
            return self.displayMonth ? self.displayMonth : worklog.month
        }

        function isHighlighted(dayNumber) {
            dayNumber = _.parseInt(dayNumber);
            var date = moment(new Date(currentMonth + '/' + dayNumber));

            return self.selectedDates.include(date);
        }

        function getFrom() {
            return self.dates.from;
        }

        function getTo() {
            return self.dates.to;
        }

        function generateTimeString() {
            if (self.selectedDates.areDefined() && !self.selectedDates.areSame()) {
                return '@' + self.selectedDates.from.format("YYYY/MM/DD") + "~" + '@' + self.selectedDates.to.format("YYYY/MM/DD");
            }
            else if (self.selectedDates.from && self.selectedDates.to) {
                return '@' + self.selectedDates.from.format("YYYY/MM/DD");
            }
            else {
                return '';
            }
        }

        function selectDay(dayNumber, event) {
            if (!self.isForOneEmployee()) {
                return;
            }

            dayNumber = _.parseInt(dayNumber);
            var date = moment(new Date(currentMonth + '/' + dayNumber));


            if (self.selectedDates.areDefined()) {
                if ((event.shiftKey) && self.selectedDates.areSame() && !self.selectedDates.from.isSame(date)) {
                    self.selectedDates.setRangeOfDates(date);
                }
                else if (self.selectedDates.areSame() && self.selectedDates.from.isSame(date)) {
                    self.selectedDates.deselect();
                }
                else {
                    self.selectedDates.setOneDate(date);
                }
            }
            else {
                self.selectedDates.setOneDate(date);
            }

            self.setDate(self.generateTimeString());
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

                    var firstDay = moment(new Date(currentMonth + '/01')).startOf('month').format("DD-MM-YYYY");
                    var lastDay = moment(new Date(currentMonth + '/01')).endOf('month').format("DD-MM-YYYY");

                    var holidaysPromise = $http.get('https://kayaposoft.com/enrico/json/v1.0/?action=getPublicHolidaysForDateRange&fromDate=' + firstDay + '&toDate=' + lastDay + '&country=pol');

                    var holidays = [];

                    holidaysPromise.then(function (result) {
                        holidays = result.data.map(function (holiday) {
                            var formatDate = moment(new Date(holiday.date.year + "/" + holiday.date.month + "/" + holiday.date.day)).format('YYYY/MM/DD');
                            return formatDate;
                        })

                        var isHoliday = function (day) {
                            for (var i = 0; i < holidays.length; i++) {
                                if (day._i === holidays[i])
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
                    }).catch(function() {
                        holidays = [];

                        var isHoliday = function (day) {
                            for (var i = 0; i < holidays.length; i++) {
                                if (day._i === holidays[i])
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
