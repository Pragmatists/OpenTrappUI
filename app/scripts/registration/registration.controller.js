angular
    .module('openTrapp.registration')
    .controller('RegistrationController', function ($scope, $http, currentEmployee, worklogEntryParser, $sce, worklog, currentMonth, $timeout) {
        var self = this;

        self.alerts = [];
        self.clearAlerts = clearAlerts;
        self.logWork = logWork;
        self.status = '';

        $scope.workLogExpression = '';

        clearExpression();

        $scope.$watch('workLogExpression', update);

        $timeout(function () {
            worklog.setMonth(currentMonth.name, function () {
                var employee = currentEmployee.username();
                worklog.enableEmployee(employee);
                worklog.enableEmployeeProjects(employee);
            });
        }, 500);

        function logWork() {
            if (!worklogEntryParser.isValid(expression())) {
                return;
            }
            var data = worklogEntryParser.parse(expression());
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

        function update() {
            if (expression() == '') {
                self.status = '';
                return;
            }
            if (worklogEntryParser.isValid(expression())) {
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

    });
