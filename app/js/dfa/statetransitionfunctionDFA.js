function StatetransitionfunctionDFA($scope) {
    "use strict";

    var self = this;
    self.functionData = {};
    self.functionData.states = [];
    self.functionData.startState = '';
    self.functionData.finalStates = '';
    self.functionData.transitions = '';
    self.functionData.statetransitionfunction = [];
    //ADD Listener
    $scope.updateListeners.push(self);


    self.updateFunction = function () {
        var arrayAlphabet = [];
        var stringAlphabet = '';
        var stringStates = '';
        var stringStateTransitions = '';
        var stringAllStateTransitions = '';
        var stringStartState = '';
        var startState;
        var stringFinalStates = '';
        var finalState;
        var i;

        self.functionData.transitions = $scope.config.alphabet;



        //Update of States
        self.functionData.states = [];
        _.forEach($scope.config.states, function (state, key) {
            stringStates = '';
            var selectedClass = '';
            if ($scope.statediagram.selectedState !== null && $scope.statediagram.selectedState.id == state.id) {
                selectedClass = "selected";
            }
            if (state.id == $scope.simulator.animated.currentState && $scope.simulator.status === "accepted") {
                stringStates += '<span class="animated-accepted ' + selectedClass + '">';
            } else if (state.id == $scope.simulator.animated.currentState && $scope.simulator.status === "not accepted") {
                stringStates += '<span class="animated-not-accepted ' + selectedClass + '">';
            } else if (state.id == $scope.simulator.animated.currentState) {
                stringStates += '<span class="animated-currentstate ' + selectedClass + '">';
            } else {
                stringStates += '<span class="' + selectedClass + '">';
            }

            stringStates += state.name;
            stringStates += '</span>';
            if (key < $scope.config.states.length - 1) {
                stringStates = stringStates + ', ';
            }
            self.functionData.states.push(stringStates);
        });



        //Update of statetransitionfunction
        self.functionData.statetransitionfunction = [];
        //we go through every state and check if there is a transition and then we save them in the statetransitionfunction array
        _.forEach($scope.config.states, function (state, keyOuter) {
            _.forEach($scope.config.transitions, function (transition, key) {

                if (transition.fromState === state.id) {
                    var stateTransition = transition;
                    var selectedTransition = false;
                    if ($scope.statediagram.selectedTransition !== null && _.find($scope.statediagram.selectedTransition.names, {
                            id: transition.id
                        }) !== undefined) {
                        selectedTransition = true;
                    }
                    var animatedCurrentState = false;
                    if ($scope.simulator.animated.transition && $scope.simulator.animated.transition.id === stateTransition.id) {
                        animatedCurrentState = true;
                    }
                    if (animatedCurrentState || selectedTransition) {
                        stringStateTransitions = '(<span class=" ' + (animatedCurrentState ? 'animated-transition' : '') + ' ' + (selectedTransition ? 'selected' : '') + '">';
                    } else {
                        stringStateTransitions = '(<span>';
                    }
                    stringStateTransitions += $scope.getStateById(stateTransition.fromState).name + ', ';
                    stringStateTransitions += stateTransition.name + ', ';
                    stringStateTransitions += $scope.getStateById(stateTransition.toState).name + '</span>)';

                    self.functionData.statetransitionfunction.push(stringStateTransitions);
                }
            });
        });


        //Update of Startstate
        startState = $scope.getStateById($scope.config.startState);
        if (startState !== undefined) {
            stringStartState += '<span class="">' + startState.name + '</span>';
        }

        self.functionData.startState = stringStartState;

        //Update of Finalstates
        _.forEach($scope.config.finalStates, function (finalState, key) {
            finalState = $scope.getStateById(finalState);
            stringFinalStates = finalState.name;
            if (key < $scope.config.finalStates.length - 1) {
                stringFinalStates += ', ';
            }
        });

        self.functionData.finalStates = stringFinalStates;

    };


    /**************
     **SIMULATION**
     *************/

    $scope.$watch('simulator.animated.currentState', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            self.updateFunction();
        }
    });

    $scope.$watch('simulator.animated.transition', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            self.updateFunction();
        }
    });

    $scope.$watch('statediagram.selectedState', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            self.updateFunction();
        }
    });

    $scope.$watch('statediagram.selectedTransition', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            self.updateFunction();
        }
    });
    $scope.$watch('simulator.status', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            self.updateFunction();
        }
    });
}