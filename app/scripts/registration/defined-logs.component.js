(function () {

    angular
        .module('openTrapp.registration')
        .component('otDefinedLogs', {
            templateUrl: 'templates/registration/defined-logs.component.html',
            controller: DefinedLogsController,
            controllerAs: 'viewModel',
            bindings: {
                definedLogs: '=',
                setLog: '='
            }
        });

    function DefinedLogsController($http, worklog, $scope, $cookies, $timeout) {
        var self = this;

        this.deleteLog = deleteLog;

        var cookies = {};
        var newCookies = {};

        function deleteLog(i) {
            cookies = angular.fromJson($cookies.get('definedLogs'));
            cookies.logs.splice(i, 1);
            self.definedLogs = cookies.logs;
            newCookies = {'logs': self.definedLogs};
            if(newCookies.logs.length > 0)
                $cookies.put('definedLogs', angular.toJson(newCookies));
            else 
                $cookies.remove('definedLogs');
        }
    }
})();