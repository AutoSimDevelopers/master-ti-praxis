//PDA
function PDA($scope, $translate) {
    "use strict";

    var self = this;
    DFA.apply(this, arguments);

    $scope.defaultConfig.stackFirstSymbol = "#";
    $scope.defaultConfig.stack = [$scope.defaultConfig.stackFirstSymbol];

    //Config Object
    $scope.config = cloneObject($scope.defaultConfig);


    /**Overrides**/
    //the statediagram controlling the svg diagramm
    $scope.simulator = new SimulationPDA($scope);
    //the statediagram controlling the svg diagramm
    $scope.statediagram = new StateDiagramPDA($scope, "#diagramm-svg");
    // the table where states and transitions are shown
    $scope.table = new TablePDA($scope);




    $scope.pushOnStack = function () {

    };


    $scope.popFromStack = function () {

    };
}