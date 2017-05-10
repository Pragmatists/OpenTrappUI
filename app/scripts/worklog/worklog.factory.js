angular
    .module('openTrapp.worklog')
    .factory('worklog', function ($http) {

        var worklog = [];
        var listeners = [];

        var that = {

            month: new String(''),
            employees: {},
            projects: {},
            entries: [],

            hasMonthSet: function () {
                return !!that.month.valueOf();
            },

            setMonth: function (month, callback) {
                $http.get('http://localhost:8080/endpoints/v1/calendar/' + month + '/work-log/entries')
                    .then(function (response) {
                        var data = response.data;
                        if (data) {

                            that.month = new String(month);
                            var projects = {};
                            var employees = {};

                            worklog = data.items;

                            var statusOf = function (x) {
                                return _.isUndefined(x) ? {active: false} : {active: x.active};
                            };

                            _(worklog).pluck('projectNames').flatten().uniq().forEach(function (project) {
                                projects[project] = statusOf(that.projects[project]);
                            });
                            _(worklog).pluck('employee').uniq().forEach(function (employee) {
                                employees[employee] = statusOf(that.employees[employee]);
                            });

                            _(that.projects).forEach(function (status, project) {
                                if (status.active && angular.isUndefined(projects[project])) {
                                    projects[project] = {hidden: true, active: true};
                                }
                            });

                            _(that.employees).forEach(function (status, employee) {
                                if (status.active && angular.isUndefined(employees[employee])) {
                                    employees[employee] = {hidden: true, active: true};
                                }
                            });

                            that.employees = employees;
                            that.projects = projects;

                            apply();
                            if (callback) {
                                callback();
                            }
                        }
                    });
            },
            toggleProject: function (projectName) {
                if (_.isUndefined(that.projects[projectName])) {
                    that.projects[projectName] = {active: true};
                } else {
                    that.projects[projectName].active = !that.projects[projectName].active;
                }
                apply();
            },
            toggleEmployee: function (employee) {

                if (_.isUndefined(that.employees[employee])) {
                    that.employees[employee] = {active: true};
                } else {
                    that.employees[employee].active = !that.employees[employee].active;
                }
                apply();
            },
            enableEmployee: function (employee) {

                that.employees[employee] = {active: true};
                apply();
            },
            enableAllEmployees: function () {
                _(that.employees).forEach(function (status) {
                    status.active = true;
                });
                apply();
            },
            disableAllEmployees: function () {
                _(that.employees).forEach(function (status) {
                    status.active = false;
                });
                apply();
            },
            enableProject: function (project) {

                that.projects[project] = {active: true};
                apply();
            },
            enableAllProjects: function () {
                _(that.projects).forEach(function (status) {
                    status.active = true;
                });
                apply();
            },
            enableProjectsWithoutRefresh: function (projectNames) {
                _(projectNames).forEach(function (project) {
                    that.projects[project] = {active: true};
                });
            },
            disableAllProjects: function () {
                _(that.projects).forEach(function (status) {
                    status.active = false;
                });
                apply();
            },
            enableEmployeeProjects: function (employee) {

                _(worklog).forEach(function (x) {
                    if (x.employee == employee) {
                        _(x.projectNames).forEach(function (project) {
                            that.enableProject(project);
                        });
                    }
                });
                apply();
            },
            remove: function (id) {
                $http({method: 'DELETE', url: 'http://localhost:8080/endpoints/v1/work-log/entries/' + id})
                    .then(function () {
                        that.setMonth(that.month);
                    });
            },
            refresh: function () {
                that.setMonth(that.month);
                apply();
            },
            reset: function () {
                that.month = new String('');
                that.employees = {};
                that.projects = {};
                that.entries = [];
                listeners = [];
            },
            onUpdate: function (listener) {
                listeners.push(listener);
            },
            asQueryExpression: function () {
                var query = "@" + that.month;
                query += " " + _(that.projects).map(function (v, p) {
                        return v.active ? "#" + p : "";
                    }).filter(nonEmpty).join(" ");
                query += " " + _(that.employees).map(function (v, m) {
                        return v.active ? "*" + m : "";
                    }).filter(nonEmpty).join(" ");
                return query;

                function nonEmpty(string) {
                    return string && string !== "";
                }
            }

        };

        var apply = function () {

            buildWorklog();
            calculateTotals();
            notifyListeners();
        };

        function hasAnyProjectActive(worklog) {
            return _(worklog.projectNames).any(function (project) {
                return that.projects[project].active;
            });
        }

        var buildWorklog = function () {
            that.entries = _(worklog)
                .filter(function (x) {
                    return that.employees[x.employee].active
                })
                .filter(function (x) {
                    return hasAnyProjectActive(x);
                })
                .value();
        };

        var calculateTotals = function () {

            var resetTotal = function (x) {
                x.total = new Workload(0);
            };
            var normalizeTotal = function (x) {
                x.total = x.total.print()
            };

            _(that.employees).forEach(resetTotal);
            _(that.projects).forEach(resetTotal);
            _([that.month]).forEach(resetTotal);

            _(worklog).forEach(function (x) {
                if (x.workload) {
                    var workload = new Workload(x.workload);
                    if (that.employees[x.employee].active && hasAnyProjectActive(x)) {
                        that.month.total = that.month.total.add(workload);
                    }
                    if (hasAnyProjectActive(x)) {
                        that.employees[x.employee].total = that.employees[x.employee].total.add(workload);
                    }
                    if (that.employees[x.employee].active) {
                        _(x.projectNames).forEach(function (project) {
                            that.projects[project].total = that.projects[project].total.add(workload);
                        });
                    }
                }
            });

            _([that.month]).forEach(normalizeTotal);
            _(that.employees).forEach(normalizeTotal);
            _(that.projects).forEach(normalizeTotal);
        };

        var notifyListeners = function () {
            _(listeners).forEach(function (listener) {
                listener.call();
            });
        };

        return that;

    });


