angular
    .module('automata-simulation')
    .controller('PDACtrl', PDACtrl);


function PDACtrl($scope, hotkeys) {
    console.log("created DFA");
    var pda = new PDA($scope);


    $scope.scrollConfig = {
        autoHideScrollbar: false,
        theme: 'dark-thick',
        advanced: {
            updateOnContentResize: true
        },
        setHeight: 220,
        scrollInertia: 0
    }; //HOTKEY
    hotkeys.add({
        combo: 'ctrl+q',
        allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
        description: 'Create state',
        callback: function (event) {
            event.preventDefault();
            $scope.statediagram.addState();
        }
    });
    hotkeys.add({
        combo: 'ctrl+e',
        description: 'Create transition',
        allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
        callback: function (event) {
            event.preventDefault();
            $scope.statediagram.addTransition();
        }
    });

    //Simulation
    hotkeys.add({
        combo: 'ctrl+1',
        description: 'Simulation: Play/Pause??',
        allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
        callback: function (event) {
            event.preventDefault();
            $scope.simulator.playOrPause();
        }
    });
    hotkeys.add({
        combo: 'ctrl+2',
        description: 'Simulation: Stop',
        allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
        callback: function (event) {
            event.preventDefault();
            $scope.simulator.stop();
        }
    });
    hotkeys.add({
        combo: 'ctrl+3',
        description: 'Simulation: Step Backwards',
        allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
        callback: function (event) {
            event.preventDefault();
            $scope.simulator.stepBackward();
        }
    });
    hotkeys.add({
        combo: 'ctrl+4',
        description: 'Simulation: Step Forward',
        allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
        callback: function (event) {
            event.preventDefault();
            $scope.simulator.stepForward();
        }
    });

    //create image
    hotkeys.add({
        combo: 'ctrl+p',
        description: 'Download Svg as Png',
        allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
        callback: function (event) {
            var scope = angular.element(document.getElementById("portationCtrl")).scope();
            event.preventDefault();
            scope.saveAsPng();
        }
    });
    //zoomFit
    hotkeys.add({
        combo: 'ctrl+x',
        description: 'ZoomFit Window',
        allowIn: ['INPUT', 'SELECT', 'TEXTAREA'],
        callback: function (event) {
            event.preventDefault();
            $scope.statediagram.zoomFitWindow();

        }
    });
    $scope.openCheatSheet = function () {
        console.log("open cheatsheet");
        hotkeys.toggleCheatSheet()();
    };



    //INTRO
    $scope.intro = {};
    $scope.intro.Active = false;
    $scope.intro.Start = function () {
        console.log("startIntro");
        $scope.intro.Active = true;
    };

    $scope.intro.Finish = function () {
        console.log("introFinish");
    };

    $scope.intro.Skip = function () {
        console.log("introskip");
    };

    $scope.intro.Config = [
        {
            type: "title",
            heading: "This is a demo",
            text: 'This is a Demo Text!<em>This can have custom html too !!!</em></span>'

            }, {
            type: "title",
            heading: "Next Demo Page",
            text: 'And Content.'
            }, {
            type: "element",
            selector: "#simulation-tab",
            heading: "Custom Title",
            text: "The demo finishes.Head over to github to learn more"
            }, {
            type: "element",
            selector: "#portationCtrl",
            heading: "Custom Title",
            text: "The demo finishes.Head over to github to learn more"
            }
        ];
}