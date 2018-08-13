describe('DefinedLogsComponent', function () {

    var $cookies, definedLogs;
    var worklog, worklogUpdated;

    beforeEach(module('openTrapp.registration'));

    beforeEach(inject(function (_$cookies_, _definedLogs_) {
        $cookies = _$cookies_;
        definedLogs = _definedLogs_;

        definedLogs.logs = [];
        $cookies.remove('definedLogs');
    }));

    describe('should delete', function(){
        it('the choosen defined log when x clicked', function(){
            $cookies.put('definedLogs', angular.toJson({logs: ['1h #projects #projectManhattan', '2h #projects']}));
            definedLogs.logs = ['1h #projects #projectManhattan', '2h #projects'];

            definedLogs.deleteLog(0);

            expect(
                angular
                .fromJson($cookies.get('definedLogs'))
            ).toEqual({
                logs: ['2h #projects']
            });

            expect(
                definedLogs.logs
            ).toEqual(['2h #projects']);
        });
    });

    it('add log to defined logs when plus button is clicked', function () {
        definedLogs.addLog('2h #ProjectManhattan @today');

        expect(definedLogs.logs).toEqual (
            ['2h #ProjectManhattan @today']
        );
    });


});