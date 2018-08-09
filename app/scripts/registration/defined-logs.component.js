(function () {

    angular
        .module('openTrapp.registration')
        .component('otDefinedLogs', {
            templateUrl: 'templates/registration/defined-logs.component.html',
            controller: DefinedLogsController,
            controllerAs: 'viewModel',
            bindings: {
                definedLogs: '<',
                setLog: '='
            }
        });

    function DefinedLogsController($http, worklog, $scope, $cookies, $timeout) {
    }
})();