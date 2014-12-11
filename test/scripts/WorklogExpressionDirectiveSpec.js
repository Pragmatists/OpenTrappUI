describe("WorklogExpressionDirective", function () {

    var outerScope;
    var compile,timeout;
    var directive,inputElement;
    var http;
    var projectNames, datesSuggestions;

    beforeEach(module("openTrapp"));

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

    it("contains input element of type 'text'", function () {
        expect(inputElement.attr("type")).toEqual("text");
    });

    it("contains input element with proper classes'", function () {
        expect(inputElement.hasClass("form-control")).toBeTruthy();
        expect(inputElement.hasClass("input-lg")).toBeTruthy();
        expect(inputElement.hasClass("worklog-expression-input")).toBeTruthy();
    });

    it("contains input with '1d #my-project' as placeholder", function () {
        expect(inputElement.attr("placeholder")).toEqual("1d #my-project");
    });

    it("contains input with 100 ms wait for typeahead", function () {
        expect(inputElement.attr("typeahead-wait-ms")).toEqual("100");
    });

    it("contains input with proper template for typeahead", function () {
        expect(inputElement.attr("typeahead-template-url")).toEqual("typeahead-template.html");
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
        userConfirmFirstSuggestion();
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
        userConfirmFirstSuggestion();

        expect(worklogExpression()).toEqual('1d #project @monday ');
    });

    it("extracts the suggestion value when available", function () {
        // given:
        followingDatesAreAvailable({value: 'monday'});

        // when:
        userTypes("1d #project @mo");
        userConfirmFirstSuggestion();

        expect(worklogExpression()).toEqual('1d #project @monday ');
    });

    it("properly puts suggestion inside text", function () {
        document.body.appendChild(directive[0]);
        // given:
        followingDatesAreAvailable("monday");

        // when:
        spyOn(outerScope,'getCursorPosition').and.returnValue(6);
        userTypes("1d @mo #project");
        userConfirmFirstSuggestion();

        expect(worklogExpression()).toEqual('1d @monday #project');
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

    function userTypes(input){
        outerScope.workLogExpression = input;
        outerScope.$digest();
    }

    function userConfirmFirstSuggestion(){
        outerScope.selectSuggestion(suggestions()[0]);
    }

    function suggestions(){
        return outerScope.suggestions;
    }

    function worklogExpression(){
        return outerScope.workLogExpression;
    }

    function compileDirective(html) {
        directive = angular.element(html);
        compile(directive)(outerScope);
        inputElement = $(directive.children()[0]);
    }

});
