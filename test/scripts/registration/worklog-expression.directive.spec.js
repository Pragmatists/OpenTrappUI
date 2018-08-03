describe("WorklogExpressionDirective", function () {

    var $q, $rootScope, $compile, $httpBackend;
    var datesSuggestions;
    var scope, element;

    beforeEach(module("openTrapp.registration"));
    beforeEach(module("karma.cached.htmls"));

    beforeEach(function () {
        installPromiseMatchers();
    });

    beforeEach(inject(function (_$q_, _$rootScope_, _$compile_, _$httpBackend_, _datesSuggestions_) {
        $q = _$q_;
        $rootScope = _$rootScope_;
        $compile = _$compile_;
        $httpBackend = _$httpBackend_;
        datesSuggestions = _datesSuggestions_;
    }));

    beforeEach(function () {
        compileDirective('<ot-worklog-expression></ot-worklog-expression>');
    });

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it("contains input with '1d #my-project' as placeholder", function () {
        expect(worklogExpressionInput().attr("placeholder")).toEqual("1d #my-project");
    });

    it("contains input with 100 ms wait for typeahead", function () {
        expect(worklogExpressionInput().attr("typeahead-wait-ms")).toEqual("100");
    });

    it("contains input with template for typeahead provided", function () {
        expect(worklogExpressionInput().attr("typeahead-template-url")).toBeDefined();
    });

    it("suggests all available projects after typing #", function () {
        // given:
        projectsReturnedByHttpAre(['ProjectManhattan', 'ApolloProgram']);

        // when:
        userTypes('#');
        var suggestions = suggestionsPromise();

        // then:
        $httpBackend.flush();
        expect(suggestions).toBeResolvedWith(['ProjectManhattan', 'ApolloProgram']);
    });

    it("completes suggestion", function () {
        projectsReturnedByHttpAre(['trainings', 'training']);
        userTypes("#trainings #train")

        scope.selectSuggestion("training");

        expect(scope.workLogExpression).toEqual("#trainings #training ");
    });

    it("does not suggest any project if # is not present", function () {
        // given:
        projectsReturnedByHttpAre(['ApolloProgram']);

        // when:
        userTypes('1d');
        var suggestions = suggestionsPromise();

        // then:
        expect(suggestions).toBeResolvedWith([]);
    });

    it("does not suggest any project if project was already specified", function () {
        // given:
        projectsReturnedByHttpAre(['ProjectManhattan', 'ApolloProgram']);

        // when:
        userTypes('1d #AppolloProject ');
        var suggestions = suggestionsPromise();

        // then:
        expect(suggestions).toBeResolvedWith([]);
    });

    it("suggest project which matches pattern", function () {
        // given:
        projectsReturnedByHttpAre(['ProjectManhattan', 'ApolloProgram', 'Application-Rewrite']);

        // when:
        userTypes('#Ap');
        var suggestions = suggestionsPromise();

        // then:
        $httpBackend.flush();
        expect(suggestions).toBeResolvedWith(['ApolloProgram', 'Application-Rewrite']);
    });

    it("suggests weekday names", function () {
        // given:
        followingDatesAreSuggested(["monday", "tuesday"]);

        // when:
        userTypes("@");
        var suggestions = suggestionsPromise();

        // then
        expect(suggestions).toBeResolvedWith(["monday", "tuesday"]);
    });

    function projectsReturnedByHttpAre(namesOfAvailableProjects) {
        $httpBackend
            .whenGET("http://localhost:8080/endpoints/v1/projects/")
            .respond(
                200,
                namesOfAvailableProjects
            );
    }

    function followingDatesAreSuggested(availableDates) {
        spyOn(datesSuggestions, 'loadAllStartingWith').and.returnValue($q.resolve(availableDates));
    }

    function userTypes(typedText) {
        scope.workLogExpression = typedText;
        scope.$digest();
    }

    function suggestionsPromise() {
        return scope.suggestions(scope.workLogExpression);
    }

    function compileDirective(html) {
        scope = $rootScope.$new();
        element = $compile(html)(scope);
        scope.$digest();
    }

    function worklogExpressionInput() {
        return angular.element(element[0]);
    }

});
