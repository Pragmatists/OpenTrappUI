describe('WorkLogEntry Parser should', function() {
	beforeEach(module('openTrApp'));

    var timeProvider;
    var worklogEntryParser;
    var currentDateString = "2014/01/02"
    var yesterdayDateString = "2014/01/01"
	var tomorrowDateString = "2014/01/03"
    var mondayBeforeTodayString = "2013/12/30"
	var fridayBeforeTodayString = "2013/12/27"

	beforeEach(inject(function(_worklogEntryParser_, _timeProvider_) {
        timeProvider = _timeProvider_;
        worklogEntryParser = _worklogEntryParser_
        spyOn(timeProvider,'getCurrentDate').andReturn(new Date(currentDateString));
	}));

	it('parse full worklog', function() {
		workLogExpression = '2h on #ProjectManhattan @2014/01/03';

        expect(worklogEntryParser.isValid(workLogExpression)).toBe(true);
        expect(worklogEntryParser.parse(workLogExpression)).toEqual(
            {
                projectName: 'ProjectManhattan',
                workload: '2h',
                day: '2014/01/03'
            }
        );
	});

    it('parse worklog for today', function() {
        workLogExpression = '2h on #ProjectManhattan';

        expect(worklogEntryParser.isValid(workLogExpression)).toBe(true);
        expect(worklogEntryParser.parse(workLogExpression).day).toEqual(currentDateString);
    });

    it('parse worklog for yesterday', function() {
        workLogExpression = '2h on #ProjectManhattan @yesterday';

        expect(worklogEntryParser.isValid(workLogExpression)).toBe(true);
        expect(worklogEntryParser.parse(workLogExpression).day).toEqual(yesterdayDateString);
    });

    it('parse worklog for monday', function() {
        workLogExpression = '2h #ProjectManhattan @monday';

        expect(worklogEntryParser.isValid(workLogExpression)).toBe(true);
        expect(worklogEntryParser.parse(workLogExpression).day).toEqual(mondayBeforeTodayString);
    });
    
    it('parse worklog for weekday with upper letter', function() {
        workLogExpression = '2h #ProjectManhattan @Monday';

        expect(worklogEntryParser.isValid(workLogExpression)).toBe(true);
        expect(worklogEntryParser.parse(workLogExpression).day).toEqual(mondayBeforeTodayString);
    });
    
    it('parse worklog for friday', function() {
        workLogExpression = '2h #ProjectManhattan @friday';

        expect(worklogEntryParser.isValid(workLogExpression)).toBe(true);
        expect(worklogEntryParser.parse(workLogExpression).day).toEqual(fridayBeforeTodayString);
    });


    it('parse worklog for yesterday by t-1', function() {
        workLogExpression = '2h on #ProjectManhattan @t-1';

        expect(worklogEntryParser.isValid(workLogExpression)).toBe(true);
        expect(worklogEntryParser.parse(workLogExpression).day).toEqual(yesterdayDateString);
    });
    
    it('parse worklog for tomorrow by t+1', function() {
        workLogExpression = '2h on #ProjectManhattan @t+1';

        expect(worklogEntryParser.isValid(workLogExpression)).toBe(true);
        expect(worklogEntryParser.parse(workLogExpression).day).toEqual(tomorrowDateString);
    });

    it('parse worklog with days and hours', function() {
        workLogExpression = '1d 3h on #ProjectManhattan @yesterday';

        expect(worklogEntryParser.isValid(workLogExpression)).toBe(true);
        expect(worklogEntryParser.parse(workLogExpression).workload).toEqual("1d 3h");
    });

    it('parse worklog with days and hours', function() {
        workLogExpression = '1d 5h 15m on #ProjectManhattan @yesterday';

        expect(worklogEntryParser.isValid(workLogExpression)).toBe(true);
        expect(worklogEntryParser.parse(workLogExpression).workload).toEqual("1d 5h 15m");
    });

    it('parse worklog for 1d by default', function() {
        workLogExpression = '#ProjectManhattan';

        expect(worklogEntryParser.isValid(workLogExpression)).toBe(true);
        expect(worklogEntryParser.parse(workLogExpression).workload).toEqual("1d");
    });

    it('not parse worklog for invalid date', function() {
        workLogExpression = '#ProjectManhattan @invalid';

        expect(worklogEntryParser.isValid(workLogExpression)).toBe(false);
    });

    it('not parse worklog for invalid date', function() {
        workLogExpression = 'invalid';

        expect(worklogEntryParser.isValid(workLogExpression)).toBe(false);
    });

    it('not parse empty project', function() {
        workLogExpression = '#';

        expect(worklogEntryParser.isValid(workLogExpression)).toBe(false);
    });

    it('not parse workload at the end of project name', function() {
        workLogExpression = '#project2d';

        expect(worklogEntryParser.isValid(workLogExpression)).toBe(true);
        expect(worklogEntryParser.parse(workLogExpression).workload).toEqual("1d");
        expect(worklogEntryParser.parse(workLogExpression).projectName).toEqual("project2d");
    });

    it('parse worklog with hyphen in project for today', function() {
        workLogExpression = '2h on #Project-Manhattan';

        expect(worklogEntryParser.isValid(workLogExpression)).toBe(true);
        expect(worklogEntryParser.parse(workLogExpression).projectName).toEqual("Project-Manhattan");
    });
});