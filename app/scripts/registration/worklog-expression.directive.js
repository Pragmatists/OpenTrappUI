angular
    .module('openTrapp.registration')
    .directive('otWorklogExpression', function ($q, projectNames, datesSuggestions) {
        return {
            restrict: 'E',
            replace: 'true',
            templateUrl: 'templates/registration/worklog-expression.directive.html',

            link: function ($scope, element) {
                var inputElement = element[0];

                var effectOfLastCompletion = new EffectOfCompletion(0);

                var suggestionSourceFor = {
                    '#': projectNames,
                    '@': datesSuggestions
                };

                var tagRegexp = /.*(@|#)([^\s]*)$/;

                $scope.suggestions = function (expression) {
                    if (expression) {
                        var tag = currentlyEditedTagIn(expression.substring(0, $scope.getCursorPosition()));
                        if (tag) {
                            return suggestionsFor(tag);
                        }
                    }
                    return emptySuggestions();
                };

                function emptySuggestions() {
                    return $q.resolve([]);
                }

                $scope.selectSuggestion = function (suggestion) {
                    if (suggestion.value) {
                        suggestion = suggestion.value;
                    }
                    var currentExpression = angular.element(inputElement).val();
                    var tag = currentlyEditedTagIn(currentExpression.substring(0, $scope.getCursorPosition()));
                    var completion = tag.symbol + suggestion + ' ';
                    var tagPostion = $scope.getCursorPosition() - tag.value.length - 1;
                    var afterTag = currentExpression.substring($scope.getCursorPosition(), currentExpression.length);
                    var beforeTag = currentExpression.substring(0, tagPostion);
                    $scope.workLogExpression = beforeTag + completion + afterTag;
                    effectOfLastCompletion = new EffectOfCompletion(tagPostion + completion.length);
                };

                $scope.getCursorPosition = function () {
                    return inputElement.selectionStart;
                };

                $scope.$watch('workLogExpression', function (newVal, oldVal) {
                    if (effectOfLastCompletion.isNotApplied()) {
                        effectOfLastCompletion.apply();
                    }
                });

                function suggestionsFor(tag) {
                    return suggestionSourceFor[tag.symbol].loadAllStartingWith(tag.value);
                }

                function currentlyEditedTagIn(input) {
                    var match = tagRegexp.exec(input);
                    if (match) {
                        return {symbol: match[1], value: match[2]};
                    } else {
                        return null;
                    }
                }

                function EffectOfCompletion(desiredCursorPosition) {
                    var applied = false;
                    this.isNotApplied = function () {
                        return applied === false;
                    };
                    this.apply = function () {
                        setCursorPositionAfterItJumpedToTheEndOnInputValueChange(desiredCursorPosition);
                        applied = true;
                    };
                }

                function setCursorPositionAfterItJumpedToTheEndOnInputValueChange(position) {
                    moveCursorToPosition(position);
                }

                function moveCursorToPosition(position) {
                    inputElement.setSelectionRange(position, position);
                }
            }
        };
    });
