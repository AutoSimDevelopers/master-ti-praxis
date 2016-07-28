// Declare app level module which depends on views, and components
var autoSim = angular.module('automata-simulation', [
  'ngRoute',
  'ui.bootstrap',
  'pascalprecht.translate',
  'jsonFormatter',
  'rzModule',
  'ngScrollbars',
  'cfp.hotkeys',
  'ngJoyRide'
]).config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/dfa', {
        templateUrl: 'view/dfa.html',
        controller: 'DFACtrl'
    });
    $routeProvider.when('/pda', {
        templateUrl: 'view/pda.html',
        controller: 'PDACtrl'
    });
    $routeProvider.otherwise({
        redirectTo: '/dfa'
    });



}]).config(['$translateProvider', function ($translateProvider) {
    //translation
    $translateProvider.useStaticFilesLoader({
        prefix: 'translations/lang-',
        suffix: '.json'
    });
    // Enable escaping of HTML
    $translateProvider.useSanitizeValueStrategy('escape');

    $translateProvider.preferredLanguage('de_DE');
}]);
autoSim.controller('DFACtrl', ['$scope', '$log', function ($scope, $log) {

}]);

/**DIRECTIVES**/

//menuButton
autoSim.directive("menubutton", function () {
    return {
        restrict: 'EA',
        replace: true,
        transclude: false,
        scope: {
            icon: '@',
            action: '&',
            tttext: '@'
        },
        template: '<button class="menu-button" type="button" ng-click="action()" aria-label="Left Align"  uib-tooltip="{{tttext | translate}}" tooltip-placement="bottom"><span class="icon icon-{{icon}} icon-position" aria-hidden="true"></span></button>'
    };
});

autoSim.directive("menuitemextendable", function () {

    return {
        restrict: 'E',
        replace: true,
        transclude: true,
        controller: function ($scope) {
            $scope.extended = true;
        },
        scope: {
            titlename: '@',
        },
        template: '<div class="menu-item"><p class="left-indextab" ng-click="extended=!extended"><span class="icon-extendable icon-chevron-down icon-extendable-set" aria-hidden="true" ng-show="extended"></span><span class="icon-extendable icon-chevron-right icon-extendable-set" aria-hidden="true" ng-show="!extended"></span><span class="left-indextab-title">{{titlename | translate}}</span></p><div class="content" ng-transclude ng-show="extended"></div></div>'

    };

});
autoSim.directive("menuitem", function () {

    return {
        restrict: 'E',
        replace: true,
        transclude: true,
        scope: {
            titlename: '@',
        },
        template: '<div class="menu-item"><p class="right-indextab right-indextab-title">{{titlename | translate}}</p><div class="content" ng-transclude></div></div>'

    };

});




//Language Controller
autoSim.controller("LangCtrl", ['$scope', '$translate', function ($scope, $translate) {
    $scope.changeLang = function (key) {
        console.log(key);
        $translate.use(key).then(function (key) {
            console.log("Sprache zu " + key + " gewechselt.");
            $scope.getCurrentLanguage();
        }, function (key) {
            console.log("Irgendwas lief schief.");
        });
    };
    $scope.getCurrentLanguage = function () {
        var currentLanguage = $translate.proposedLanguage() || $translate.use();
        switch (currentLanguage) {
        case "de_DE":
            $scope.activeLanguage = '<span class="flag-icon flag-icon-de"></span> Deutsch';
            break;
        case "en_EN":
            $scope.activeLanguage = '<span class="flag-icon flag-icon-gb"></span> English';
            break;
        }
    };
    $scope.getCurrentLanguage();
}]);



autoSim.controller("portationCtrl", ['$scope', function ($scope) {
    $scope.export = function () {

        // if no automaton exist, disable export (button)

        /**
         * Returns all transition without the objReference
         * @return {Array} array of transition objects
         */
        function getTransitions() {
            var allTransitions = [];
            _.forEach($scope.$parent.config.transitions, function (transition, key) {
                var tmpTransition = JSON.parse(JSON.stringify(transition));
                delete tmpTransition.objReference;
                allTransitions.push(tmpTransition);
            });
            return allTransitions;
        }

        /**
         * Returns all transition without the objReference
         * @return {Array} array of transition objects
         */
        function getStates() {
            var allStates = [];
            _.forEach($scope.$parent.config.states, function (state, key) {
                var tmpState = JSON.parse(JSON.stringify(state));
                delete tmpState.objReference;
                allStates.push(tmpState);
            });
            return allStates;
        }
        $scope.$parent.config.unSavedChanges = false;
        //workaround: couldnt add new states after export
        $scope.$parent.statediagram.resetAddActions();
        var exportData = {};
        exportData = $scope.config;
        exportData.transitions = getTransitions();
        exportData.states = getStates();
        var data = window.JSON.stringify(exportData);
        console.log(exportData);
        var blob = new Blob([data], {
            type: "application/json",
        });
        saveAs(blob, $scope.config.name + ".json");

    };

    $scope.saveAsPng = function () {
        saveSvgAsPng(document.getElementById("diagramm-svg"), $scope.config.name + ".png");
    };

    $scope.import = function () {
        if ($scope.$parent.config.states.length === 0) {
            $scope.$parent.importFile();
        } else {
            $scope.$parent.showModalWithMessage('IMPORT.TITLE', 'IMPORT.DESC', 'importFile()');
            //Called when the user clicks on the import Button and opens the hidden-file-input
        }
    };

    $scope.$parent.importFile = function () {
        angular.element('#hidden-file-upload').trigger('click');
    };

    /* jshint -W083 */
    /* jshint -W117 */
    /* jshint -W084 */
    function handleFileSelect(evt) {
        var files = evt.target.files; // FileList object

        // files is a FileList of File objects. List some properties.
        var output = [];

        for (var i = 0, f; f = files[i]; i++) {
            var reader = new FileReader();

            // Closure to capture the file information.
            reader.onload = (function (theFile) {
                return function (e) {
                    try {
                        var json = JSON.parse(e.target.result);
                        //import the data to the automaton
                        $scope.importConfig(json);

                    } catch (ex) {
                        alert('ex when trying to parse json = ' + ex);
                    }
                };
            })(f);
            reader.readAsText(f);
        }

    }

    $scope.importConfig = function (jsonObj) {
        //clear the config at the start
        console.log($scope.$parent);
        $scope.resetAutomaton();
        var tmpObject = cloneObject(jsonObj);
        //clear the objects we create after 
        tmpObject.states = [];
        tmpObject.transitions = [];
        tmpObject.startState = null;
        tmpObject.finalStates = [];
        $scope.$parent.config = tmpObject;
        createOtherObjects(jsonObj);
        console.log($scope.$parent.config);
        $scope.$parent.statediagram.updateZoomBehaviour();
    };

    function createOtherObjects(jsonObj) {
        //create States
        _.forEach(jsonObj.states, function (value, key) {
            $scope.$parent.addStateWithId(value.id, value.name, value.x, value.y);
        });
        //create transitions
        _.forEach(jsonObj.transitions, function (value, key) {
            $scope.$parent.addTransitionWithId(value.id, value.fromState, value.toState, value.name);
        });
        //create startstate
        $scope.$parent.changeStartState(jsonObj.startState);
        //create finalStates
        _.forEach(jsonObj.finalStates, function (value, key) {
            $scope.$parent.addFinalState(value);
        });
    }

    document.getElementById('hidden-file-upload').addEventListener('change', handleFileSelect, false);

            }]);





//from: http://stackoverflow.com/questions/19415394/with-ng-bind-html-unsafe-removed-how-do-i-inject-html
autoSim.filter('to_trusted', ['$sce', function ($sce) {
    return function (text) {
        return $sce.trustAsHtml(text);
    };
    }]);


// to defocus an field, when clicked on someother place than the focused field
/* jshint -W030 */
autoSim.directive('showFocus', function ($timeout) {
    return function (scope, element, attrs) {
        scope.$watch(attrs.showFocus,
            function (newValue) {
                $timeout(function () {
                    newValue && element[0].focus();
                });
            }, true);
    };
});