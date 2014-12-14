describe("WorklogExpressionDirective", function () {

    var outerScope;
    var compile, timeout;
    var inputElement;
    var http;
    var projectNames, datesSuggestions;
    var spiedCursorPosition;

    beforeEach(module("openTrapp"));
    beforeEach(module("karma.cached.htmls"));

    beforeEach(inject(function(_enviromentInterceptor_){
        _enviromentInterceptor_.request = function(x){
            return x;
        };
    }));

    beforeEach(inject(function ($rootScope, $compile,$timeout,$httpBackend,_projectNames_,_datesSuggestions_) {
        outerScope= $rootScope.$new();
        compile = $compile;
        timeout = $timeout;
        http = $httpBackend;
        projectNames = _projectNames_;
        datesSuggestions = _datesSuggestions_;
    }));

    beforeEach(function () {
        compileDirective('<worklog-expression></worklog-expression>');
    });

    beforeEach(function () {
        spyCursorPosition();
        resetCursorSpiedReturnValue();
    });

    it("contains input with '1d #my-project' as placeholder", function () {
        expect($(inputElement).attr("placeholder")).toEqual("1d #my-project");
    });

    it("contains input with 100 ms wait for typeahead", function () {
        expect($(inputElement).attr("typeahead-wait-ms")).toEqual("100");
    });

    it("contains input with proper template for typeahead", function () {
        expect($(inputElement).attr("typeahead-template-url")).toEqual("templates/typeahead-template.html");
    });

    it("suggests all available projects after typing #", function(){
        // given:
        followingProjectsAreAvailable('ProjectManhattan', 'ApolloProgram');
        // when:
        userTypes('#');
        // then:
        expect(suggestions()).toContain('ProjectManhattan', 'AppolloProgram');
    });

    it("does not suggest any projects if # is not present", function(){
        // given:
        followingProjectsAreAvailable('ProjectManhattan', 'ApolloProgram');
        // when:
        userTypes('1d');
        // then:
        expect(suggestions()).toEqual([]);
    });

    it("does not suggest any projects if # is recently added character", function(){
        // given:
        followingProjectsAreAvailable('ProjectManhattan', 'ApolloProgram');
        // when:
        userTypes('1d #AppolloProject @Proj');
        // then:
        expect(suggestions()).not.toContain('ProjectManhattan')
    });

    it("does not suggest any projects if # is recently added character", function(){
        // given:
        followingProjectsAreAvailable('ProjectManhattan', 'ApolloProgram');
        // when:
        userTypes('1d #ApolloProject ');
        // then:
        expect(suggestions()).toEqual([]);
    });

    it("suggest project starts with pattern", function(){
        // given:
        followingProjectsAreAvailable('ProjectManhattan', 'ApolloProgram');
        // when:
        userTypes('#Ap');
        // then:
        expect(suggestions()).toEqual(['ApolloProgram']);
    });

    it("complete project name on selecting suggestions", function(){
        // given:
        followingProjectsAreAvailable('ProjectManhattan', 'ApolloProgram');
        // when:
        userTypes('1d #ApolloPro');
        userConfirmsFirstSuggestion();
        // then:
        expect(worklogExpression()).toEqual('1d #ApolloProgram ');
    });

    it("suggest weekday names", function () {
        // given:
        followingDatesAreAvailable("monday", "tuesday");

        // when:
        userTypes("@");

        expect(suggestions()).toEqual(["monday", "tuesday"]);
    });

    it("suggest weekday names", function () {
        // given:
        followingDatesAreAvailable("monday");

        // when:
        userTypes("1d #project @mo");
        userConfirmsFirstSuggestion();

        expect(worklogExpression()).toEqual('1d #project @monday ');
    });

    it("extracts the suggestion value when available", function () {
        // given:
        followingDatesAreAvailable({value: 'monday'});

        // when:
        userTypes("1d #project @mo");
        userConfirmsFirstSuggestion();

        expect(worklogExpression()).toEqual('1d #project @monday ');
    });

    it("completes word inside expression", function () {
        // given:
        followingProjectsAreAvailable('ProjectManhattan');
        followingDatesAreAvailable("monday");
        userTypes("@monday 1d");

        // when:
        userMovesCursorToPosition("@monday ".length).andTypes("#ProjectMan");
        userConfirmsFirstSuggestion();

        expect(worklogExpression()).toEqual('@monday #ProjectManhattan 1d');
    });

    it("puts new characters after space after completed word", function(){
        // given:
        followingProjectsAreAvailable('ProjectManhattan');
        userTypes('#ProjectMan');
        userConfirmsFirstSuggestion();

        // when:
        userTypes('1d');

        // then:
        expect(worklogExpression()).toEqual('#ProjectManhattan 1d');
    });

    function followingProjectsAreAvailable(){
        var args = _.toArray(arguments);
        http.expectGET("http://localhost:8080/endpoints/v1/projects/").respond(200, args);
        projectNames.forEach(function(){});
        http.flush();
    }

    function followingDatesAreAvailable() {
        var args = _.toArray(arguments);
        spyOn(datesSuggestions,'startingWith').and.returnValue(args);
    }

    function userMovesCursorToPosition(position) {
        cursorPositionIs(position);
        outerScope.$digest();
        return {
            andTypes: function(input) {
                userTypes(input);
            }
        }
    }

    function userTypes(input) {
        if (worklogExpression() == undefined) {
            setWorklogExpression(input);
        } else {
            insertIntoWorklogExpression(outerScope.getCursorPosition(), input);
        }
        outerScope.$digest();
    }

    function userConfirmsFirstSuggestion(){
        outerScope.selectSuggestion(suggestions()[0]);
        resetCursorSpiedReturnValue();
        outerScope.$digest();
    }

    function suggestions(){
        return outerScope.suggestions(worklogExpression());
    }

    function worklogExpression(){
        return outerScope.workLogExpression;
    }

    function setWorklogExpression(expression){
        outerScope.workLogExpression = expression;
        cursorPositionIs(expression.length);
    }

    function insertIntoWorklogExpression(position, input) {
        var expression = worklogExpression();
        expression = expression.substr(0, position) + input + expression.substr(position);
        setWorklogExpression(expression);
        cursorPositionIs(position + input.length);
    }

    function cursorPositionIs(position) {
        spiedCursorPosition.and.returnValue(position);
    }

    function resetCursorSpiedReturnValue() {
        spiedCursorPosition.and.callThrough();
    }

    function spyCursorPosition() {
        spiedCursorPosition = spyOn(outerScope, 'getCursorPosition');
    }

    function compileDirective(html) {
        var directive = angular.element(html);
        compile(directive)(outerScope);
        outerScope.$digest();
        inputElement = directive[0];
    }

});
