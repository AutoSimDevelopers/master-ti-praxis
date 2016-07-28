//TESTDATA
function TestData($scope) {
    "use strict";
    var self = this;

    self.testDFA = function () {
        $scope.config.inputWord = "abc";
        $scope.addStateWithPresets(100, 100);
        $scope.addStateWithPresets(100, 300);
        $scope.addStateWithPresets(300, 300);
        $scope.addStateWithPresets(300, 100);
        $scope.addFinalState(3);


        $scope.addTransition(0, 1, "a");
        $scope.addTransition(1, 2, "b");
        $scope.addTransition(2, 3, "c");
        $scope.addTransition(3, 0, "l");

    };

}