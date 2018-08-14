angular
    .module('openTrapp.registration')
    .controller('RegistrationController', function ($scope, $http, currentEmployee, worklogEntryParser, $sce, worklog, currentMonth, $timeout, $cookies, definedLogs) {
        var self = this;

        self.alerts = [];
        self.clearAlerts = clearAlerts;
        self.logWork = logWork;
        self.previousMonth = previousMonth;
        self.nextMonth = nextMonth;
        self.addLog = addLog;
        self.setLog = setLog;
        self.extractDates = extractDates;
        self.status = '';
        $scope.selectedMonth = currentMonth;
        $scope.workLogExpression = '';

        clearExpression();

        $scope.$watch('workLogExpression', update);

        $timeout(function () {
            worklog.setMonth(currentMonth.name, function () {
                var employee = currentEmployee.username();
                worklog.enableEmployee(employee);
                worklog.enableEmployeeProjects(employee);
            });

            if (angular.isDefined($cookies.get('lastExpression')) && $cookies.get('useLastExpression') === 'true')
                $scope.workLogExpression = $cookies.get('lastExpression');

        }, 500);

        function logWork() {
            var datesRangeSelector = /\@\d+\/\d+\/\d+\-\d+\/\d+\/\d+/g;
            var datesRange = expression().match(datesRangeSelector);
            var logToValidate = expression();
            var datesToReport = [];

            if (datesRange != null) {
                logToValidate = logToValidate.replace(datesRangeSelector, "#d_a_t_e");
                datesToReport = self.extractDates(datesRange[0]);
            }
            else {
                datesToReport.push(expression());
            }

            if (!worklogEntryParser.isValid(logToValidate)) {
                return;
            }

            for (var i = 0; i < datesToReport.length; i++) {
                var pom = logToValidate.replace("#d_a_t_e", '@' + datesToReport[i]);
                var data = worklogEntryParser.parse(pom);
                $http
                    .post('http://localhost:8080/endpoints/v1/employee/' + currentEmployee.username() + '/work-log/entries', data)
                    .then(function () {
                        $cookies.put('lastExpression', expression());

                        clearExpression();
                        update();
                        var projectNames = _(data.projectNames).map(function (name) {
                            return sprintf("<b>%s</b>", name);
                        }).join(",");
                        var message = sprintf(
                            '<b>Hurray!</b> You  have successfully logged <b>%s</b> on %s on <b>%s</b>.',
                            data.workload,
                            projectNames,
                            data.day
                        );
                        self.alerts = [{
                            type: 'success',
                            message: $sce.trustAsHtml(message)
                        }];
                        worklog.enableProjectsWithoutRefresh(data.projectNames);
                        worklog.refresh();
                    })
                    .catch(function () {
                        var message = '<b>Oops...</b> Server is not responding.';
                        self.alerts = [{
                            type: 'danger',
                            message: $sce.trustAsHtml(message)
                        }];
                    });
            }
        }

        function update() {
            if (expression() == '') {
                self.status = '';
                return;
            }
            var datesRangeSelector = /\@\d+\/\d+\/\d+\-\d+\/\d+\/\d+/g;
            var logToValidate = expression().replace(datesRangeSelector, "#d_a_t_e");
            if (worklogEntryParser.isValid(logToValidate)) {
                self.status = 'success';
            } else {
                self.status = 'error';
            }
        }

        function clearAlerts() {
            self.alerts = [];
        }

        function expression() {
            return $scope.workLogExpression;
        }

        function clearExpression() {
            $scope.workLogExpression = '';
        }

        function nextMonth() {
            $scope.selectedMonth = $scope.selectedMonth.next();
            worklog.setMonth($scope.selectedMonth.name, function () {
                var employee = currentEmployee.username();
                worklog.enableEmployee(employee);
                worklog.enableEmployeeProjects(employee);
            });
        }

        function previousMonth() {
            $scope.selectedMonth = $scope.selectedMonth.prev();
            worklog.setMonth($scope.selectedMonth.name, function () {
                var employee = currentEmployee.username();
                worklog.enableEmployee(employee);
                worklog.enableEmployeeProjects(employee);
            });
        }

        function addLog() {
            if (self.status === 'success' && expression().trim() !== '') {
                definedLogs.addLog(expression().trim());
            }
        }

        function setLog(log) {
            $scope.workLogExpression = log;
        }

        function extractDates(string) {
            string = string.substring(1);
            var dateStrings = string.split('-');

            var result = [];

            var start = moment(dateStrings[0], "YYYY/MM/DD");
            var end = moment(dateStrings[1], "YYYY/MM/DD");

            for (var day = start; day <= end; day = day.add(1, 'd')) {
                result.push(day.format("YYYY/MM/DD"));
            }

            return result;
        }

    });
