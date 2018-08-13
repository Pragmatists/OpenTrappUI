(function () {

    angular
        .module('openTrapp.registration')
        .component('otDefinedLogs', {
            templateUrl: 'templates/registration/defined-logs.component.html',
            controller: DefinedLogsController,
            controllerAs: 'viewModel',
            bindings: {
                setLog: '='
            }
        });

    function DefinedLogsController($cookies, definedLogs) {
        var self = this;
        this.deleteLog = deleteLog;
        
        angular.extend(self, {
            definedLogs: definedLogs
        });

        function deleteLog(i) {
            definedLogs.deleteLog(i);
        }
    }
})();