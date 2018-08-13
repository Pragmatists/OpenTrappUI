describe('DefinedLogsComponent', function () {

    var $httpBackend, $rootScope, $componentController, $cookies;
    var worklog, worklogUpdated;

    beforeEach(module('openTrapp.registration'));

    beforeEach(inject(function (_$rootScope_, _$componentController_, _$httpBackend_, _$cookies_) {
        $rootScope = _$rootScope_;
        $componentController = _$componentController_;
        $httpBackend = _$httpBackend_;
        $cookies = _$cookies_;
    }));

    describe('should delete', function(){
        it('the choosen defined log when x clicked', function(){
            var component = newDefinedLogsComponent({setLog: function(){}, definedLogs: ['1h #projects #projectManhattan', '2h #projects']});

            $cookies.put('definedLogs', angular.toJson({logs: ['1h #projects #projectManhattan', '2h #projects']}));

            component.deleteLog(0);

            expect(
                angular
                .fromJson($cookies.get('definedLogs'))
            ).toEqual({
                logs: ['2h #projects']
            });

            expect(
                component.definedLogs
            ).toEqual(['2h #projects']);
        });
    });

    function newDefinedLogsComponent(bindings) {
        return $componentController(
            'otDefinedLogs',
            {
                $scope: $rootScope.$new(),
                worklog: worklog
            },
            bindings
        );
    }


});