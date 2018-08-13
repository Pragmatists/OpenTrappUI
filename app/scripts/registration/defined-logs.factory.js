angular
    .module('openTrapp.registration')
    .factory('definedLogs', function ($cookies) {

        var logs = [];

        if(angular.isDefined($cookies.get('definedLogs')))
            logs = angular.fromJson($cookies.get('definedLogs')).logs;

        var that = {

            logs: logs,

            addLog: function (log) {
                that.logs.push(log);
                that.logs = _.uniq(that.logs);
                $cookies.put('definedLogs', angular.toJson({'logs':that.logs}));
            },

            deleteLog: function(i) {
                cookies = angular.fromJson($cookies.get('definedLogs'));
                cookies.logs.splice(i, 1);
                that.logs = cookies.logs;

                if(cookies.logs.length > 0)
                    $cookies.put('definedLogs', angular.toJson(cookies));
                else 
                    $cookies.remove('definedLogs');
            }

        }

        return that;

    });


