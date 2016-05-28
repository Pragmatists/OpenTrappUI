angular
    .module('openTrapp.worklog')
    .controller('EditCtrl', function ($scope, $uibModal, projectNames, worklog) {
        var self = this;

        self.open = open;

        function open(item) {

            var modalInstance = $uibModal.open({
                templateUrl: 'templates/worklog/edit.html',
                controller: 'EditModalCtrl',
                controllerAs: 'editModal',
                resolve: {
                    item: function () {
                        return item;
                    },
                    projectNames: function () {
                        return projectNames;
                    },
                    worklog: function () {
                        return worklog;
                    }
                }
            });

            modalInstance.result.then(function (result) {
                // FIXME - publish alert to some global alert displayer
                $scope.alerts = $scope.alerts || [];
                $scope.alerts.push(result)
            })

        }

    })
    .controller('EditModalCtrl', function ($uibModalInstance, item, $http, worklog) {
        var self = this;

        self.item = angular.copy(item);
        self.isInvalidWorkload = isInvalidWorkload;
        self.ok = ok;
        self.cancel = cancel;

        function isInvalidWorkload(workload) {
            return !Workload.isValid(workload);
        }

        function ok() {
            var data = {
                workload: self.item.workload,
                projectName: self.item.projectName
            };
            $http.post('http://localhost:8080/endpoints/v1/work-log/entries/' + self.item.id, data)
                .then(function () {
                    $uibModalInstance.close({
                        type: 'success',
                        message: 'Worklog updated'
                    });
                    worklog.refresh();
                });
        }

        function cancel() {
            $uibModalInstance.dismiss('cancel');
        }
    });