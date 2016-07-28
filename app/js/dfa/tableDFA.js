//TableDFA
function TableDFA($scope) {
    var self = this;
    self.states = [];
    $scope.updateListeners.push(self);


    self.updateFunction = function () {
        self.states = [];
        self.alphabet = [];
        var dfa = $scope.config;



        var alphabetCounter;

        //prepare alphabet
        _.forEach($scope.config.alphabet, function (character, key) {
            var selectedTrans = "";
            if ($scope.statediagram.selectedTransition !== null && _.find($scope.statediagram.selectedTransition.names, {
                    name: character
                }) !== undefined) {
                selectedTrans = "selected";
            }

            var tmp;
            if ($scope.simulator.animated.transition && $scope.simulator.animated.transition.name === character) {
                tmp = '<span class="animated-transition ' + selectedTrans + '">' + character + '</span>';
            } else {
                tmp = '<span class="' + selectedTrans + '">' + character + '</span>';
            }
            self.alphabet.push(tmp);
        });

        // iterates over all States
        _.forEach($scope.config.states, function (state, key) {


            var tmpObject = {};
            tmpObject.id = state.id;
            // marks the current active state at the simulation in the table
            var selectedClass = "";
            if (($scope.statediagram.selectedState !== null && $scope.statediagram.selectedState.id == state.id) || ($scope.statediagram.selectedTransition !== null && $scope.statediagram.selectedTransition.fromState === state.id)) {
                selectedClass = "selected";
            }
            if ($scope.simulator.animated.currentState == state.id) {
                var animatedClass = "";
                if ($scope.simulator.status === "accepted") {
                    animatedClass = "animated-accepted";
                } else if ($scope.simulator.status === "not accepted") {
                    animatedClass = "animated-not-accepted";
                } else {
                    animatedClass = "animated-currentstate";
                }

                tmpObject.name = '<span class="' + animatedClass + ' ' + selectedClass + '">' + state.name + '</span>';
            } else {
                tmpObject.name = '<span class="' + selectedClass + '">' + state.name + '</span>';
            }

            if ($scope.isStateAFinalState(state.id))
                tmpObject.finalState = true;
            else
                tmpObject.finalState = false;

            if ($scope.config.startState === state.id)
                tmpObject.startState = true;
            else
                tmpObject.startState = false;

            tmpObject.trans = [];


            // iterates over all aplphabet 
            _.forEach($scope.config.alphabet, function (character, key) {
                var foundTransition = null;

                // iterates over the available transitions and saves found transitions
                _.forEach($scope.config.transitions, function (transition, key) {
                    if (transition.fromState === state.id && transition.name === character) {
                        foundTransition = transition;
                    }
                });

                var trans = {};
                trans.alphabet = character;

                // saves the found Transition in "Trans.State"
                if (foundTransition !== null) {
                    var tmpToState = $scope.getStateById(foundTransition.toState);
                    var selectedTrans = "";
                    if ($scope.statediagram.selectedTransition !== null && $scope.statediagram.selectedTransition.toState === tmpToState.id) {
                        selectedTrans = "selected";
                    }
                    if ($scope.simulator.animated.nextState == tmpToState.id && foundTransition.name == $scope.simulator.animated.transition.name) {
                        trans.State = '<span class="animated-nextstate ' + selectedTrans + '">' + tmpToState.name + '</span>';
                    } else {
                        trans.State = '<span class="' + selectedTrans + '">' + tmpToState.name + '</span>';
                    }
                } else {
                    trans.State = "";
                }

                tmpObject.trans.push(trans);
            });
            self.states.push(tmpObject);

        });

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
    $scope.$watch('simulator.animated.nextState', function (newValue, oldValue) {
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

}