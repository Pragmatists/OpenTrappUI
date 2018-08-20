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
        self.getDatesArray = getDatesArray;
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
            var datesToReport = [];
            var tags;

            var fromDatesRangeSelector = /\@[A-Z0-9/a-z]+\-/g;
            var toDatesRangeSelector = /\-\@[A-Z0-9/a-z]+/g;
            var fromDate;
            var toDate;
            var fromDateMatch = expression().match(fromDatesRangeSelector);

            if (angular.isArray(fromDateMatch))
                fromDate = fromDateMatch[0].slice(0, -1);

            var toDateMatch = expression().match(toDatesRangeSelector);

            if (angular.isArray(toDateMatch))
                toDate = toDateMatch[0].slice(1);

            if (angular.isUndefined(fromDate) || angular.isUndefined(toDate)) {
                var dateMatch = expression().match(/\@[A-Z0-9/a-z]+/g);
                if (angular.isArray(dateMatch)) {
                    fromDate = dateMatch[0];
                    toDate = fromDate;
                    tags = expression().replace(/\@[A-Z0-9/a-z]+/g, '');
                }
                else {
                    tags = expression();
                    fromDate = "";
                    toDate = "";
                }
            }
            else {
                tags = expression().replace(/\@[A-Z0-9/a-z]+\-\@[A-Z0-9/a-z]+/g, '');
            }

            if (self.status !== 'success') {
                return;
            }

            datesToReport = getDatesArray(fromDate, toDate);

            $cookies.put('lastExpression', expression());

            for (var i = 0; i < datesToReport.length; i++) {
                var logString = tags + " @" + datesToReport[i];
                var data = worklogEntryParser.parse(logString);
                $http
                    .post('http://localhost:8080/endpoints/v1/employee/' + currentEmployee.username() + '/work-log/entries', data)
                    .then(function () {

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

            var fromDatesRangeSelector = /\@[A-Z0-9/a-z]+\-/g;
            var toDatesRangeSelector = /\-\@[A-Z0-9/a-z]+/g;
            var fromDate;
            var toDate;
            var fromDateMatch = expression().match(fromDatesRangeSelector);
            var tags;

            if (angular.isArray(fromDateMatch))
                fromDate = fromDateMatch[0].slice(0, -1);

            var toDateMatch = expression().match(toDatesRangeSelector);

            if (angular.isArray(toDateMatch))
                toDate = toDateMatch[0].slice(1);

            if (angular.isUndefined(fromDate) || angular.isUndefined(toDate)) {
                var dateMatch = expression().match(/\@[A-Z0-9/a-z]+/g);
                if (angular.isArray(dateMatch)) {
                    fromDate = dateMatch[0];
                    toDate = fromDate;
                    tags = expression().replace(/\@[A-Z0-9/a-z]+/g, '');
                }
                else {
                    tags = expression();
                    fromDate = "";
                    toDate = "";
                }
            }
            else {
                tags = expression().replace(/\@[A-Z0-9/a-z]+\-\@[A-Z0-9/a-z]+/g, '');
            }


            if (
                worklogEntryParser.isValid(tags + fromDate) &&
                worklogEntryParser.isValid(tags + toDate)
            ) {
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

        function getDatesArray(from, to) {

            var fromData = worklogEntryParser.parse('1h #projects ' + from);
            var toData = worklogEntryParser.parse('1h #projects ' + to);

            var result = [];

            var start = moment(fromData.day, "YYYY/MM/DD");
            var end = moment(toData.day, "YYYY/MM/DD");

            if (end.isBefore(start)) {
                var pom = start;
                start = end;
                end = pom;
            }

            for (var day = start; day <= end; day = day.add(1, 'd')) {
                if (day.days() > 0 && day.days() < 6)
                    result.push(day.format("YYYY/MM/DD"));
            }

            return result;
        }

    });
