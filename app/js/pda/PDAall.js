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
//Simulator for the simulation of the PDA
function SimulationPDA($scope) {
    "use strict";

    var self = this;
    SimulationDFA.apply(self, arguments);

}
//statediagram for the PDA
function StateDiagramPDA($scope, svgSelector) {
    "use strict";

    var self = this;
    StateDiagramDFA.apply(self, arguments);

    self.drawStack = function () {

    };

}
//statediagram for the PDA
function StatetransitionfunctionPDA($scope) {
    "use strict";

    var self = this;
    StatetransitionfunctionDFA.apply(self, arguments);

}
//statediagram for the PDA
function TablePDA($scope) {
    "use strict";

    var self = this;
    TableDFA.apply(self, arguments);

}
//Simulator for the simulation of the PDA
function SimulationPDA($scope) {
    "use strict";

    var self = this;
    SimulationDFA.apply(self, arguments);

}
//statediagram for the PDA
function StateDiagramPDA($scope, svgSelector) {
    "use strict";

    var self = this;
    StateDiagramDFA.apply(self, arguments);

    self.drawStack = function () {

    };

}
//statediagram for the PDA
function StatetransitionfunctionPDA($scope) {
    "use strict";

    var self = this;
    StatetransitionfunctionDFA.apply(self, arguments);

}
//statediagram for the PDA
function TablePDA($scope) {
    "use strict";

    var self = this;
    TableDFA.apply(self, arguments);

}
//Simulator for the simulation of the PDA
function SimulationPDA($scope) {
    "use strict";

    var self = this;
    SimulationDFA.apply(self, arguments);

}
//statediagram for the PDA
function StateDiagramPDA($scope, svgSelector) {
    "use strict";

    var self = this;
    StateDiagramDFA.apply(self, arguments);

    self.drawStack = function () {

    };

}
//statediagram for the PDA
function StatetransitionfunctionPDA($scope) {
    "use strict";

    var self = this;
    StatetransitionfunctionDFA.apply(self, arguments);

}
//statediagram for the PDA
function TablePDA($scope) {
    "use strict";

    var self = this;
    TableDFA.apply(self, arguments);

}