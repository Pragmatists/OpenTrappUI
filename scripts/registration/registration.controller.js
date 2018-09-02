angular
    .module('openTrapp.registration')
    .controller('RegistrationController', function ($scope, $http, currentEmployee, worklogEntryParser, $sce, worklog, currentMonth, $timeout, $cookies, definedLogs, $q) {
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
        self.setDate = setDate;
        $scope.dates = {
            from: undefined,
            to: undefined
        }

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

            var fromDatesRangeSelector = /\@[A-Z0-9/a-z-]+\~/g;
            var toDatesRangeSelector = /\~\@[A-Z0-9/a-z-]+/g;
            var fromDate;
            var toDate;
            var fromDateMatch = expression().match(fromDatesRangeSelector);

            if (angular.isArray(fromDateMatch))
                fromDate = fromDateMatch[0].slice(0, -1);

            var toDateMatch = expression().match(toDatesRangeSelector);

            if (angular.isArray(toDateMatch))
                toDate = toDateMatch[0].slice(1);

            if (angular.isUndefined(fromDate) || angular.isUndefined(toDate)) {
                var dateMatch = expression().match(/\@[A-Z0-9/a-z-]+/g);
                if (angular.isArray(dateMatch)) {
                    fromDate = dateMatch[0];
                    toDate = fromDate;
                    tags = expression().replace(/\@[A-Z0-9/a-z-]+/g, '');
                }
                else {
                    tags = expression();
                    fromDate = "";
                    toDate = "";
                }
            }
            else {
                tags = expression().replace(/\@[A-Z0-9/a-z-]+\~\@[A-Z0-9/a-z-]+/g, '');
            }

            if (self.status !== 'success') {
                return;
            }

            datesToReport = getDatesArray(fromDate, toDate);

            $cookies.put('lastExpression', expression());

            var requests = $q.all(datesToReport
                .map(function (date) {
                    var logString = tags + " @" + date;
                    return worklogEntryParser.parse(logString);
                })
                .map(function (data) {
                    return $http.post('http://localhost:8080/endpoints/v1/employee/' + currentEmployee.username() + '/work-log/entries', data)
                }))

            var logString = tags + " @" + datesToReport[0];
            var dataFrom = worklogEntryParser.parse(logString);

            logString = tags + " @" + datesToReport[datesToReport.length - 1];
            var dataTo = worklogEntryParser.parse(logString);

            requests
                .then(function () {

                    clearExpression();
                    update();

                    var projectNames = _(dataFrom.projectNames).map(function (name) {
                        return sprintf("<b>%s</b>", name);
                    }).join(",");

                    var message;

                    if (datesToReport.length === 1) {
                        message = sprintf(
                            '<b>Hurray!</b> You  have successfully logged <b>%s</b> on %s on <b>%s</b>.',
                            dataFrom.workload,
                            projectNames,
                            dataFrom.day
                        );
                    }
                    else {
                        message = sprintf(
                            '<b>Hurray!</b> You  have successfully logged <b>%s</b> on %s on working days from <b>%s</b> to <b>%s</b>.',
                            dataFrom.workload,
                            projectNames,
                            dataFrom.day,
                            dataTo.day
                        );
                    }

                    self.alerts = [{
                        type: 'success',
                        message: $sce.trustAsHtml(message)
                    }];

                    worklog.enableProjectsWithoutRefresh(dataFrom.projectNames);
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

        function update() {
            if (expression() == '') {
                self.status = '';
                $scope.dates = {};
                return;
            }

            var fromDatesRangeSelector = /\@[A-Z0-9/a-z-]+\~/g;
            var toDatesRangeSelector = /\~\@[A-Z0-9/a-z-]+/g;
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
                var dateMatch = expression().match(/\@[A-Z0-9/a-z-]+/g);
                if (angular.isArray(dateMatch)) {
                    fromDate = dateMatch[0];
                    toDate = fromDate;
                    tags = expression().replace(/\@[A-Z0-9/a-z-]+/g, '');
                }
                else {
                    tags = expression();
                    fromDate = "";
                    toDate = "";
                }
            }
            else {
                tags = expression().replace(/\@[A-Z0-9/a-z-]+\~\@[A-Z0-9/a-z-]+/g, '');
            }

            if (worklogEntryParser.isValid('1h #projects ' + fromDate) &&
                worklogEntryParser.isValid('1h #projects ' + toDate)) {

                $scope.dates.from = moment(new Date(worklogEntryParser.parse('1h #projects ' + fromDate).day));
                $scope.dates.to = moment(new Date(worklogEntryParser.parse('1h #projects ' + toDate).day));

                var before = $scope.dates.from.isBefore($scope.dates.to) ? $scope.dates.from : $scope.dates.to;
                var after = $scope.dates.from.isAfter($scope.dates.to) ? $scope.dates.from : $scope.dates.to;

                $scope.dates.from = before;
                $scope.dates.to = after;
                $scope.dates = {from: before, to: after};
            } else {
                $scope.dates = {};
            }


            if (
                worklogEntryParser.isValid(tags + " " + fromDate) &&
                worklogEntryParser.isValid(tags + " " + toDate)
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

            if (from === to) {
                result.push(start.format("YYYY/MM/DD"));
                return result;
            }

            for (var day = start; day <= end; day = day.add(1, 'd')) {
                if (day.days() > 0 && day.days() < 6)
                    result.push(day.format("YYYY/MM/DD"));
            }

            return result;
        }

        function setDate(timeString) {
            if (expression().match(/\@[A-Z0-9/a-z-]+\~\@[A-Z0-9/a-z-]+/g) != null) {
                setLog(expression().replace(/\@[A-Z0-9/a-z-]+\~\@[A-Z0-9/a-z-]+/g, timeString));
            }
            else if (expression().match(/\@[A-Z0-9/a-z-]+/g) != null) {
                setLog(expression().replace(/\@[A-Z0-9/a-z-]+/g, timeString));
            }
            else if (expression().length > 0 && expression()[expression().length - 1] !== ' ') {
                setLog(expression() + " " + timeString);
            }
            else {
                setLog(expression() + timeString);
            }
        }

    });
