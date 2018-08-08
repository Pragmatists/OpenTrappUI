(function () {

    angular
        .module('openTrapp.registration')
        .component('otDefinedLogs', {
            templateUrl: 'templates/registration/defined-logs.component.html',
            controller: DefinedLogsController,
        });

    function DefinedLogsController($http, worklog) {
        var self = this;
    }
})