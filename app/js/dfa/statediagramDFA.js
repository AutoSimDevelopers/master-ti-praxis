//statediagram for the svg diagramm
function StateDiagramDFA($scope, svgSelector) {
    "use strict";

    var self = this;

    self.preventStateDragging = false;
    self.inAddTransition = false;
    self.selectedState = null;

    //prevents call from the svouterclicklistener
    self.preventSvgOuterClick = false;
    self.selectedTransition = null;
    self.showStateMenu = false;
    self.showTransitionMenu = false;
    self.selectedStateName = "selectedForTransition";
    //user can snap the states to the grid -> toggles snapping
    self.snapping = true;

    //statediagram settings
    self.settings = {
        stateRadius: 25,
        finalStateRadius: 29,
        selected: false
    };
    //is for the selfReference
    var stretchX = 40;
    var stretchY = 18;

    //for the selfReference transition
    self.stateSelfReferenceNumber = Math.sin(45 * (Math.PI / 180)) * self.settings.stateRadius;

    /**
     * Check if transition already drawn
     * @param   {number}  fromState 
     * @param   {number}  toState   
     * @returns {boolean}
     */
    self.existsDrawnTransition = function (fromState, toState) {

        var tmp = false;
        for (var i = 0; i < $scope.config.drawnTransitions.length; i++) {
            var transition = $scope.config.drawnTransitions[i];
            if (transition.fromState == fromState && transition.toState == toState) {
                tmp = true;
            }
        }
        return tmp;
    };

    /**
     * Get a drawn Transition
     * @param   {number} fromState 
     * @param   {number} toState   
     * @returns {object} 
     */
    self.getDrawnTransition = function (fromState, toState) {
        for (var i = 0; i < $scope.config.drawnTransitions.length; i++) {
            var transition = $scope.config.drawnTransitions[i];
            if (transition.fromState == fromState && transition.toState == toState) {
                return transition;
            }
        }
        return undefined;
    };

    /**
     * Clears the svgContent, resets scale and translate and delete drawnTransitionContent
     */
    self.clearSvgContent = function () {
        //first close Menus
        self.closeStateMenu();
        self.closeTransitionMenu();
        //Clear the content of the svg
        self.svgTransitions.html("");
        self.svgStates.html("");
        $scope.config.drawnTransitions = [];
        //change the scale and the translate to the defaultConfit
        self.svg.attr("transform", "translate(" + $scope.defaultConfig.diagramm.x + "," + $scope.defaultConfig.diagramm.y + ")" + " scale(" + $scope.defaultConfig.diagramm.scale + ")");
        svgOuterZoomAndDrag.scale($scope.defaultConfig.diagramm.scale);
        svgOuterZoomAndDrag.translate([$scope.defaultConfig.diagramm.x, $scope.defaultConfig.diagramm.y]);

    };

    /****ZOOMHANDLER START***/
    //amount the user can zoom out
    self.zoomMax = 2.5;
    //amount the user can zoom in
    self.zoomMin = 0.5;
    self.zoomValue = 0.1;

    self.zoomIn = function () {
        $scope.config.diagramm.scale = ($scope.config.diagramm.scale + self.zoomValue) > self.zoomMax ? $scope.config.diagramm.scale : Math.floor(($scope.config.diagramm.scale + self.zoomValue) * 100) / 100;
        self.updateZoomBehaviour();
    };
    self.zoomOut = function () {

        $scope.config.diagramm.scale = ($scope.config.diagramm.scale - self.zoomValue) <= self.zoomMin ? $scope.config.diagramm.scale : Math.floor(($scope.config.diagramm.scale - self.zoomValue) * 100) / 100;
        self.updateZoomBehaviour();

    };

    /**
     * This method zooms the svg to a specific scale
     * @param {number} value the zoom value
     */
    self.zoomTo = function (value) {
        console.log("zoomtedto");
        $scope.config.diagramm.scale = value / 100;
        $scope.safeApply();
        self.updateZoomBehaviour();
    };

    /**
     * This method updates the d3 zoombehaviour (fixes weird bugs)
     */
    self.updateZoomBehaviour = function () {
        $scope.safeApply();
        self.svg.attr("transform", "translate(" + $scope.config.diagramm.x + "," + $scope.config.diagramm.y + ")" + " scale(" + $scope.config.diagramm.scale + ")");
        svgOuterZoomAndDrag.scale($scope.config.diagramm.scale);
        svgOuterZoomAndDrag.translate([$scope.config.diagramm.x, $scope.config.diagramm.y]);
    };

    /**
     * This method zooms the svg to a calculated scale, so the complete svg fits in the window
     */
    self.zoomFitWindow = function () {
        var stateXCoor = [];
        var stateYCoor = [];
        var minX = 0;
        var maxX = 0;
        var minY = 0;
        var maxY = 0;
        var topShifting = 0;
        var leftShifting = 0;
        var i;
        var obj;
        var width = self.svgOuter.style("width").replace("px", "");
        var height = self.svgOuter.style("height").replace("px", "");

        /*
         * set the diagrammscale on 100%. We got the advantage, that the method also zoom in, if the automaton doesn't fit the window. 
         * But the method doesn't really zoom in. It sets the scale on 100% an then zoom out.
         */
        $scope.config.diagramm.scale = 1.0;

        /**
         * check if there exist at least one state. If the diagram is empty, there is nothing to fit the window.
         * The state with the lowest x- and y-coordinate defines the minimum-x- and minimum-y-coordinate from the automaton.
         * The state with the highest x- and y-coordinate defines the maximum-x- and maximum-y-coordiante from the automaten
         */

        if ($scope.config.states.length > 0) {
            for (i = 0; i < $scope.config.states.length; i++) {
                stateXCoor[i] = $scope.config.states[i].x;
            }

            for (i = 0; i < $scope.config.states.length; i++) {
                stateYCoor[i] = $scope.config.states[i].y;
            }
            minX = _.min(stateXCoor);
            maxX = _.max(stateXCoor);
            minY = _.min(stateYCoor);
            maxY = _.max(stateYCoor);

            /* 
             * While the size of the automaton is bigger than the diagram, zoom out. 
             * We work with the width and the height from the diagram proportional to the scale.
             */
            while (((maxX - minX + 150) > (width / $scope.config.diagramm.scale)) || ((maxY - minY + 200) > (height / $scope.config.diagramm.scale))) {
                $scope.config.diagramm.scale -= 0.01;
            }
            $scope.safeApply();

            //Calculation of a topshifting and a leftshifting, so the automaton is centered in the diagram.
            topShifting = (((height / $scope.config.diagramm.scale) - (maxY - minY)) / 2);
            leftShifting = (((width / $scope.config.diagramm.scale) - (maxX - minX)) / 2);

            //set the diagram-x and -y values and update the diagram.
            $scope.config.diagramm.x = -(minX * $scope.config.diagramm.scale) + (leftShifting * $scope.config.diagramm.scale);
            $scope.config.diagramm.y = -(minY * $scope.config.diagramm.scale) + (topShifting * $scope.config.diagramm.scale);
            self.updateZoomBehaviour();
        } else {
            self.scaleAndTranslateToDefault();
        }
    };

    /**
     * Scale and Translate the Svg to the default Value
     */
    self.scaleAndTranslateToDefault = function () {
        $scope.config.diagramm.scale = $scope.defaultConfig.diagramm.scale;
        $scope.config.diagramm.x = $scope.defaultConfig.diagramm.x;
        $scope.config.diagramm.y = $scope.defaultConfig.diagramm.y;
        $scope.safeApply();
        self.updateZoomBehaviour();
    };

    //the svgouterzoom and drag listener
    var svgOuterZoomAndDrag = d3.behavior
        .zoom()
        .scaleExtent([self.zoomMin, self.zoomMax])
        .on("zoom", function () {
            var stop = d3.event.button || d3.event.ctrlKey;
            if (stop) d3.event.stopImmediatePropagation(); // stop zoom
            //dont translate on right click (3)
            if (d3.event.sourceEvent.which !== 3) {
                var newScale = Math.floor(d3.event.scale * 100) / 100;

                $scope.config.diagramm.scale = newScale;
                $scope.config.diagramm.x = d3.event.translate[0];
                $scope.config.diagramm.y = d3.event.translate[1];
                $scope.safeApply();
                self.svg.attr("transform", "translate(" + $scope.config.diagramm.x + "," + $scope.config.diagramm.y + ")" + " scale(" + $scope.config.diagramm.scale + ")");
            } else {
                console.log("rightclick!");
            }
        });


    //prevents the normal rightclickcontextmenu and add zoom
    self.svgOuter = d3.select(svgSelector)
        .call(svgOuterZoomAndDrag)
        //prevents doubleclick zoom
        .on("dblclick.zoom", null)
        //adds our custom context menu on rightclick
        .on("contextmenu", function () {
            d3.event.preventDefault();
        });

    /**
     * Click Listener when clicking on the outer svg =(not clicking on state or transition)
     */
    self.addSvgOuterClickListener = function () {
        self.svgOuter.on("click", function () {
            if (!self.preventSvgOuterClick) {
                self.closeStateMenu();
                self.closeTransitionMenu();
                $scope.safeApply();
            } else {
                //remove clickbool
                self.preventSvgOuterClick = false;
            }
        });
    };

    //add at the start
    self.addSvgOuterClickListener();

    //the html element where we put the svgGrid into
    self.svgGrid = self.svgOuter.append("g").attr("id", "grid");

    //inner svg
    self.svg = self.svgOuter
        .append("g")
        .attr("id", "svg-items");


    //first draw the transitions -> nodes are in front of them if they overlap
    self.svgTransitions = self.svg.append("g").attr("id", "transitions");
    self.svgStates = self.svg.append("g").attr("id", "states");



    //the space between each SnappingPoint 1:(0,0)->2:(0+gridSpace,0+gridSpace)
    self.gridSpace = 100;
    //the distance when the state is snapped to the next SnappingPoint (Rectangle form)
    self.gridSnapDistance = 20;
    //is Grid drawn
    self.isGrid = true;

    //watcher for the grid when changed -> updateGrid
    $scope.$watch('[statediagram.isGrid , config.diagramm]', function () {
        self.drawGrid();
    }, true);

    /**
     * Draw the Grid
     */
    self.drawGrid = function () {
        if (self.isGrid) {
            //clear grid
            self.svgGrid.html("");
            var width = self.svgOuter.style("width").replace("px", "");
            var height = self.svgOuter.style("height").replace("px", "");
            var thickness = 1 * $scope.config.diagramm.scale * 0.5;
            var xOffset = ($scope.config.diagramm.x % (self.gridSpace * $scope.config.diagramm.scale));
            var yOffset = ($scope.config.diagramm.y % (self.gridSpace * $scope.config.diagramm.scale));
            var i;
            //xGrid
            for (i = xOffset; i < width; i += self.gridSpace * $scope.config.diagramm.scale) {
                self.svgGrid
                    .append("line")
                    .attr("stroke-width", thickness)
                    .attr("class", "grid-line xgrid-line")
                    .attr("x1", i)
                    .attr("y1", 0)
                    .attr("x2", i)
                    .attr("y2", height);
            }
            //yGrid
            for (i = yOffset; i < height; i += self.gridSpace * $scope.config.diagramm.scale) {
                self.svgGrid
                    .append("line")
                    .attr("stroke-width", thickness)
                    .attr("class", "grid-line ygrid-line")
                    .attr("x1", 0)
                    .attr("y1", i)
                    .attr("x2", width)
                    .attr("y2", i);
            }
        } else {
            //undraw Grid
            self.svgGrid.html("");
        }
    };


    //DEFS
    self.defs = self.svg.append('svg:defs');
    //Marker-Arrow ( for the transitions)
    self.defs.append('svg:marker')
        .attr('id', 'marker-end-arrow')
        .attr('refX', 7.5)
        .attr('refY', 3)
        .attr('markerWidth', 10)
        .attr('markerHeight', 10)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,0 L0,6 L9,3 z');
    self.defs.append('svg:marker')
        .attr('id', 'marker-end-arrow-create')
        .attr('refX', 7.5)
        .attr('refY', 3)
        .attr('markerWidth', 10)
        .attr('markerHeight', 10)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,0 L0,6 L9,3 z');
    self.defs.append('svg:marker')
        .attr('id', 'marker-end-arrow-animated')
        .attr('refX', 7.5)
        .attr('refY', 3)
        .attr('markerWidth', 10)
        .attr('markerHeight', 10)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,0 L0,6 L9,3 z');
    self.defs.append('svg:marker')
        .attr('id', 'marker-end-arrow-hover')
        .attr('refX', 7.5)
        .attr('refY', 3)
        .attr('markerWidth', 10)
        .attr('markerHeight', 10)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,0 L0,6 L9,3 z');
    self.defs.append('svg:marker')
        .attr('id', 'marker-end-arrow-selection')
        .attr('refX', 4)
        .attr('refY', 3)
        .attr('markerWidth', 5)
        .attr('markerHeight', 10)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,0 L0,6 L9,3 z');


    /**
     * Reset all the AddListeners
     */
    self.resetAddActions = function () {
        self.closeStateMenu();
        self.closeTransitionMenu();
        self.svgOuter.on("click", null);
        self.inAddTransition = false;
        self.inAddState = false;
    };

    /**
     * AddState -> creates a new state when clicked on the button with visual feedback
     */
    self.addState = function () {
        self.resetAddActions();
        //add listener that the selectedstate follows the mouse
        self.svgOuter.on("mousemove", function () {
            //move the state (only moved visually not saved)
            self.selectedState.objReference.attr("transform", "translate(" + (((d3.mouse(this)[0]) - $scope.config.diagramm.x) * (1 / $scope.config.diagramm.scale)) + " " +
                (((d3.mouse(this)[1]) - $scope.config.diagramm.y) * (1 / $scope.config.diagramm.scale)) + ")");
        });
        //create a new selectedState in a position not viewable
        self.selectedState = $scope.addStateWithPresets(-10000, -10000);
        //add a class to the state (class has opacity)
        self.selectedState.objReference.classed("state-in-creation", true);
        self.svgOuter.on("click", function () {
            //remove class
            self.selectedState.objReference.classed("state-in-creation", false);
            //update the stateData
            self.selectedState.x = (((d3.mouse(this)[0]) - $scope.config.diagramm.x) * (1 / $scope.config.diagramm.scale));
            self.selectedState.y = (((d3.mouse(this)[1]) - $scope.config.diagramm.y) * (1 / $scope.config.diagramm.scale));
            self.selectedState.objReference.attr("transform", "translate(" + self.selectedState.x + " " + self.selectedState.y + ")");
            //remove mousemove listener
            self.svgOuter.on("mousemove", null);
            //overwrite the click listener
            self.addSvgOuterClickListener();
            self.preventSvgOuterClick = false;
            $scope.safeApply();

        });
    };

    /**
     * Addtransition function for the icon
     */
    self.addTransition = function () {
        self.resetAddActions();
        //prevent dragging during addTransition
        self.preventStateDragging = true;
        //1. FirstClick: select a state and create a tmpLine for visual feedback
        //SecondClick: Create a transition from selectState to the clickedState
        d3.selectAll(".state").on("click", function () {
            self.mouseInState = true;
            //if there is no selected state then select a state
            if (self.selectedState === null) {
                self.selectedState = $scope.getStateById(parseInt(d3.select(this).attr("object-id")));
                self.toggleState(self.selectedState.id, true);

                //create tmpLine
                self.tmpTransition = self.svgTransitions.append("g")
                    .attr("class", "transition");
                //the line itself with the arrow without the path itself
                self.tmpTransitionline = self.tmpTransition.append("path")
                    .attr("class", "transition-line curvedLine in-creation")
                    .attr("marker-end", "url(#marker-end-arrow-create)")
                    .attr("fill", "none");

                //if already selected a state then create transition to the clickedState
            } else {
                var tmpTransition = $scope.addTransition(self.selectedState.id, parseInt(d3.select(this).attr("object-id")), $scope.getNextTransitionName(self.selectedState.id));
                self.toggleState(self.selectedState.id, false);
                self.tmpTransition.remove();
                self.tmpTransition = null;
                self.tmpTransitionline = null;
                self.preventStateDragging = false;
                //update the svgOuter listeners
                self.addSvgOuterClickListener();
                self.svgOuter.on("mousemove", null);
                //update state listeners
                d3.selectAll(".state").on("mouseover", null);
                d3.selectAll(".state").on("mouseleave", null);
                d3.selectAll('.state').on('click', self.openStateMenu);

                //openTransitionMenu
                self.openTransitionMenu(tmpTransition.id);
            }

        });
        //2. if the mouse moves on the svgOuter and not on a state, then update the tmpLine
        self.svgOuter.on("mousemove", function () {
            if (!self.mouseInState && self.selectedState !== null) {
                var x = (((d3.mouse(this)[0]) - $scope.config.diagramm.x) * (1 / $scope.config.diagramm.scale));
                var y = (((d3.mouse(this)[1]) - $scope.config.diagramm.y) * (1 / $scope.config.diagramm.scale));
                var pathLine = self.bezierLine([[self.selectedState.x, self.selectedState.y], [x, y]]);
                self.tmpTransitionline.attr("d", pathLine);
            }
        });

        //3. if the mouse moves on a state then give a visual feedback how the line connects with the state
        d3.selectAll(".state").on("mouseover", function (i) {
            //see 2.
            self.mouseInState = true;
            //we need an other state to connect the line
            if (self.selectedState !== null) {
                var otherState = $scope.getStateById(d3.select(this).attr("object-id"));
                var transition = {};
                transition.fromState = self.selectedState.id;
                transition.toState = otherState.id;
                var line = self.tmpTransitionline;
                if (!self.existsDrawnTransition(self.selectedState.fromState, self.selectedState.toState)) {
                    //the group element
                    //if it is not a self Reference
                    if (transition.fromState != transition.toState) {
                        var drawConfig = self.getTransitionDrawConfig(transition);
                        //if there is a transition in the other direction
                        if (drawConfig.approachTransition) {
                            //other transition in the other direction
                            var otherTrans = self.getDrawnTransition(transition.toState, transition.fromState);
                            var otherDrawConfig = self.getTransitionDrawConfig(otherTrans, true);
                            self.updateTransitionLines(otherTrans.objReference, otherDrawConfig.path);
                            otherTrans.objReference.select(".transition-text")
                                .attr("x", otherDrawConfig.xText)
                                .attr("y", otherDrawConfig.yText);
                            //update the transition text position
                            self.otherTransition = otherTrans;

                        }
                        //get the curve data ( depends if there is a transition in the oposite direction)
                        line.attr("d", drawConfig.path);
                        //if it is a selfreference
                    } else {
                        var stateId = $scope.getArrayStateIdByStateId(transition.fromState);
                        var x = $scope.config.states[stateId].x;
                        var y = $scope.config.states[stateId].y;
                        line.attr("d", self.selfTransition(x, y));
                    }
                    //if there is already a transition with the same fromState and toState then the current
                } else {
                    //add the name to the drawnTransition
                    var drawnTransition = self.getDrawnTransition(transition.fromState, transition.toState);
                    drawnTransition.names.push(transition.name);
                    //drawn the new name to the old transition (svg)
                    self.writeTransitionText(drawnTransition.objReference.select(".transition-text"), drawnTransition.names);


                }
                self.tmpTransitionline.attr("x1", self.selectedState.x)
                    .attr("y1", self.selectedState.y)
                    .attr("x2", otherState.x)
                    .attr("y2", otherState.y);
            }
        }).on("mouseleave", function () {
            self.mouseInState = false;
            //remove the visual feedback from transition going against our tmpLine
            if (self.otherTransition !== null && self.otherTransition !== undefined) {
                var otherDrawConfig = self.getTransitionDrawConfig(self.otherTransition);
                self.updateTransitionLines(self.otherTransition.objReference, otherDrawConfig.path);
                self.otherTransition.objReference.select(".transition-text")
                    .attr("x", (otherDrawConfig.xText))
                    .attr("y", (otherDrawConfig.yText));
            }
        });
    };

    /**
     * Renames the state in the svg after the $scope variable was changed
     * @param  {number} stateId      
     * @param  {String} newStateName          
     */
    self.renameState = function (stateId, newStateName) {
        var state = $scope.config.states[$scope.getArrayStateIdByStateId(stateId)];
        var objReference = state.objReference;
        objReference.select("text").text(newStateName);
    };

    /**
     * Removes the state with the given id
     * @param  {number} stateId 
     */
    self.removeState = function (stateId) {
        self.closeStateMenu();
        var state = $scope.config.states[$scope.getArrayStateIdByStateId(stateId)];
        var objReference = state.objReference;
        objReference.remove();
    };


    /**
     * Renames a transition
     * @param {number} fromState         the fromStateId
     * @param {number} toState           the toStateID
     * @param {number} transitionId      the transitionid
     * @param {char}   newTransitionName the new transitionname
     */
    self.renameTransition = function (fromState, toState, transitionId, newTransitionName) {
        //change it in drawnTransition
        var drawnTransition = self.getDrawnTransition(fromState, toState);
        var drawnTransitionName = _.find(drawnTransition.names, {
            "id": transitionId
        });
        drawnTransitionName.name = newTransitionName;

        //change it on the svg
        self.writeTransitionText(drawnTransition.objReference.select(".transition-text"), drawnTransition.names);
    };


    /**
     * removes a transition from the svg
     * @param   {number}   transitionId
     */
    self.removeTransition = function (transitionId) {
        var tmpTransition = $scope.getTransitionById(transitionId);
        var tmpDrawnTransition = self.getDrawnTransition(tmpTransition.fromState, tmpTransition.toState);
        var drawConfig = self.getTransitionDrawConfig(tmpTransition);
        self.closeTransitionMenu();
        //if its the only transition in the drawn transition -> then remove the drawn transition
        if (tmpDrawnTransition.names.length === 1) {
            tmpDrawnTransition.objReference.remove();
            _.remove($scope.config.drawnTransitions, function (n) {
                return n == tmpDrawnTransition;
            });
            //if there is an approad transition, then draw it with the new drawconfig
            if (drawConfig.approachTransition) {
                //other transition in the other direction
                var otherTrans = self.getDrawnTransition(tmpTransition.toState, tmpTransition.fromState);
                var otherDrawConfig = self.getTransitionDrawConfig(otherTrans, false);
                self.updateTransitionLines(otherTrans.objReference, otherDrawConfig.path);
                otherTrans.objReference.select(".transition-text")
                    .attr("x", otherDrawConfig.xText)
                    .attr("y", otherDrawConfig.yText);
                //update the transition text position
                self.otherTransition = otherTrans;

            }
        }
        //if there are other transitions with the same from- and tostate, then remove the transition from the names and redraw the text
        else {
            _.remove(tmpDrawnTransition.names, function (n) {
                return n.id == tmpTransition.id;
            });
            self.writeTransitionText(tmpDrawnTransition.objReference.select(".transition-text"), tmpDrawnTransition.names);
            drawConfig = self.getTransitionDrawConfig(tmpTransition);
            tmpDrawnTransition.objReference.select(".transition-text")
                .attr("x", drawConfig.xText)
                .attr("y", drawConfig.yText);
            console.log(tmpDrawnTransition);

            self.openTransitionMenu(tmpDrawnTransition.names[tmpDrawnTransition.names.length - 1].id);

        }


    };

    /**
     * Adds a stateId to the final states on the svg (visual feedback)
     * @param {number} stateId
     */
    self.addFinalState = function (stateId) {
        var state = $scope.getStateById(stateId);
        state.objReference.insert("circle", ".state-circle")
            .attr("class", "final-state")
            .attr("r", self.settings.finalStateRadius);

        //TODO: update the transitions to the state

    };

    /**
     * Removes a final state on the svg
     * @param {number} stateId 
     */
    self.removeFinalState = function (stateId) {
        var state = $scope.getStateById(stateId);
        state.objReference.select(".final-state").remove();
        //TODO update the transitions to the state
    };

    /**
     * Changes the StartState to the stateid
     * @param {number} stateId 
     */
    self.changeStartState = function (stateId) {
        //TODO:
        //remove old startState
        if ($scope.config.startState !== null) {
            var state = $scope.getStateById($scope.config.startState);
            state.objReference.select(".start-line").remove();
        }

        var otherState = $scope.getStateById(stateId);
        otherState.objReference.append("line")
            .attr("class", "transition-line start-line")
            .attr("x1", 0)
            .attr("y1", 0 - 75)
            .attr("x2", 0)
            .attr("y2", 0 - self.settings.stateRadius - 4)
            .attr("marker-end", "url(#marker-end-arrow)");
    };

    /**
     * removes the stateId
     * @param {number} stateId
     */
    self.removeStartState = function (stateId) {
        var state = $scope.getStateById($scope.config.startState);
        state.objReference.select(".start-line").remove();
        $scope.config.startState = null;
        $scope.updateListener();
    };

    /**
     * Draws a State 
     * @param  {number} id the stateid
     * @return {Reference}    Returns the reference of the group object
     */
    self.drawState = function (id) {
        var state = $scope.getStateById(id);
        var group = self.svgStates.append("g")
            .attr("transform", "translate(" + state.x + " " + state.y + ")")
            .attr("class", "state " + "state-" + state.id)
            .attr("object-id", state.id); //save the state-id

        var circle = group.append("circle")
            .attr("class", "state-circle")
            .attr("r", self.settings.stateRadius);
        //for outer circle dotted when selected

        var hoverCircle = group.append("circle")
            .attr("class", "state-circle hover-circle")
            .attr("r", self.settings.stateRadius);

        var text = group.append("text")
            .text(state.name)
            .attr("class", "state-text")
            .attr("dominant-baseline", "central")
            .attr("text-anchor", "middle");

        state.objReference = group;
        group.on('click', self.openStateMenu)
            .call(self.dragState);
        return group;
    };

    /**
     * Adds or remove a class to a state ( only the svg state)
     * @param {number} stateId 
     * @param {Boolean} state   
     * @param {String} className  
     */
    self.setStateClassAs = function (stateId, state, className) {
        var objReference = $scope.getStateById(stateId).objReference;
        objReference.classed(className, state);
    };

    /**
     * Sets a transition class to a specific class or removes the specific class
     * @param {number}   transitionId
     * @param {boolean} state        if the class should be added or removed
     * @param {string}  className    the classname
     */
    self.setTransitionClassAs = function (transitionId, state, className) {
        var trans = $scope.getTransitionById(transitionId);
        var objReference = self.getDrawnTransition(trans.fromState, trans.toState).objReference;
        objReference.classed(className, state);
        if (state && className == 'animated-transition') {
            objReference.select(".transition-line").attr("marker-end", "url(#marker-end-arrow-animated)");
        } else {
            objReference.select(".transition-line").attr("marker-end", "url(#marker-end-arrow)");
        }
    };

    /**
     * sets the arrow marker of a transition, cause we couldnt change the color of an arrow marker
     * @param {object} transLine the transitionlineobject
     * @param {string} suffix    which arrow should be changed
     */
    self.setArrowMarkerTo = function (transLine, suffix) {

        if (suffix !== '') {
            transLine.select('.transition-line').attr("marker-end", "url(#marker-end-arrow-" + suffix + ")");
        } else {
            transLine.select('.transition-line').attr("marker-end", "url(#marker-end-arrow)");
        }
    };


    /**
     * Opens the StateMenu
     */
    self.openStateMenu = function () {
        console.log("open state menu");
        self.closeStateMenu();
        self.closeTransitionMenu();
        //fixes weird errors
        $scope.safeApply();

        self.preventSvgOuterClick = true;
        self.showStateMenu = true;
        self.selectedState = $scope.getStateById(parseInt(d3.select(this).attr("object-id")));
        //add new state as selected
        self.toggleState(self.selectedState.id, true);

        //save the state values in the state context as default value
        self.input = {};
        self.input.state = self.selectedState;
        self.input.stateName = self.selectedState.name;
        self.input.startState = $scope.config.startState == self.selectedState.id;
        self.input.finalState = $scope.isStateAFinalState(self.selectedState.id);
        self.input.ttt = "";
        self.input.tttisopen = false;
        $scope.safeApply();
        self.stateMenuListener = [];
        //Menu watcher
        self.stateMenuListener.push($scope.$watch('statediagram.input.startState', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                if (self.input.startState) {
                    $scope.changeStartState(self.input.state.id);
                } else {
                    if (self.selectedState.id == $scope.config.startState)
                        $scope.removeStartState();
                }
            }

        }));
        self.stateMenuListener.push($scope.$watch('statediagram.input.finalState', function (newValue, oldValue) {
            if (newValue !== oldValue) {
                if (self.input.finalState) {
                    $scope.addFinalState(self.input.state.id);
                } else {
                    $scope.removeFinalState(self.input.state.id);
                }

            }

        }));
        self.stateMenuListener.push($scope.$watch('statediagram.input.stateName', function (newValue, oldValue) {
            //if the name got changed but is not empty
            //reset the tooltip
            self.input.tttisopen = false;
            if (newValue !== oldValue) {
                //change if the name doesnt exists and isnt empty
                if (newValue !== "" && !$scope.existsStateWithName(newValue)) {
                    var renameError = !$scope.renameState(self.input.state.id, newValue);
                } else if (newValue === "") {
                    //FEEDBACK
                    self.input.tttisopen = true;
                    self.input.ttt = 'STATE_MENU.NAME_TOO_SHORT';
                } else if ($scope.existsStateWithName(newValue, self.input.state.id)) {
                    self.input.tttisopen = true;
                    self.input.ttt = 'STATE_MENU.NAME_ALREADY_EXIST';
                }
            }
        }));
    };

    /**
     * closes the state menu
     */
    self.closeStateMenu = function () {
        //remove old StateMenuListeners
        _.forEach(self.stateMenuListener, function (value, key) {
            value();
        });
        if (self.selectedState !== null) {
            self.toggleState(self.selectedState.id, false);
        }
        self.stateMenuListener = null;
        self.showStateMenu = false;

        //delete input
        self.input = null;
    };

    /**
     * toggle a state
     * @param {number} stateId 
     * @param {bool}   bool
     */
    self.toggleState = function (stateId, bool) {
        self.setStateClassAs(stateId, bool, "active");
        if (bool === false) {
            self.selectedState = null;
        }

    };


    //Node drag and drop behaviour
    self.dragState = d3.behavior.drag()
        .on("dragstart", function () {
            //stops drag bugs when wanted to click
            self.dragAmount = 0;
            d3.event.sourceEvent.stopPropagation();
        })
        .on("drag", function () {

            if (d3.event.sourceEvent.which == 1) {
                if (!self.preventStateDragging) {
                    self.dragAmount++;

                    var x = d3.event.x;
                    var y = d3.event.y;

                    if (self.snapping) {


                        var snapPointX = x - (x % self.gridSpace);
                        var snapPointY = y - (y % self.gridSpace);

                        //check first snapping Point (top left)
                        if (x > snapPointX - self.gridSnapDistance && x < snapPointX + self.gridSnapDistance && y > snapPointY - self.gridSnapDistance && y < snapPointY + self.gridSnapDistance) {
                            x = snapPointX;
                            y = snapPointY;
                            //second snapping point (top right)
                        } else if (x > snapPointX + self.gridSpace - self.gridSnapDistance && x < snapPointX + self.gridSpace + self.gridSnapDistance && y > snapPointY - self.gridSnapDistance && y < snapPointY + self.gridSnapDistance) {
                            x = snapPointX + self.gridSpace;
                            y = snapPointY;
                            //third snapping point (bot left)
                        } else if (x > snapPointX - self.gridSnapDistance && x < snapPointX + self.gridSnapDistance && y > snapPointY + self.gridSpace - self.gridSnapDistance && y < snapPointY + self.gridSpace + self.gridSnapDistance) {
                            x = snapPointX;
                            y = snapPointY + self.gridSpace;
                            //fourth snapping point (bot right)
                        } else if (x > snapPointX + self.gridSpace - self.gridSnapDistance && x < snapPointX + self.gridSpace + self.gridSnapDistance && y > snapPointY + self.gridSpace - self.gridSnapDistance && y < snapPointY + self.gridSpace + self.gridSnapDistance) {
                            x = snapPointX + self.gridSpace;
                            y = snapPointY + self.gridSpace;
                        }
                    }

                    //on drag isnt allowed workaround for bad drags when wanted to click
                    if (self.dragAmount > 1) {

                        //update the shown node
                        d3.select(this)
                            .attr("transform", "translate(" + x + " " + y + ")");
                        //update the node in the array

                        var stateId = d3.select(this).attr("object-id");
                        var tmpState = $scope.getStateById(stateId);
                        //update the state coordinates in the dataobject
                        tmpState.x = x;
                        tmpState.y = y;

                        //update the transitions after dragging a node
                        self.updateTransitionsAfterStateDrag(d3.select(this).attr("object-id"));
                    }
                }
            }

        }).on("dragend", function () {
            //save the movement
            if (self.dragAmount > 1) {
                $scope.safeApply();
            }
        });


    /**
     * gets the path for a selftransition
     * @param   {number} x
     * @param   {number} y 
     * @returns {String} path of the selftransition
     */
    self.selfTransition = function (x, y) {
        return self.bezierLine([
                [x - self.stateSelfReferenceNumber, y - self.stateSelfReferenceNumber],
                [x - self.stateSelfReferenceNumber - stretchX, y - self.stateSelfReferenceNumber - stretchY],
                [x - self.stateSelfReferenceNumber - stretchX, y + self.stateSelfReferenceNumber + stretchY],
                [x - self.stateSelfReferenceNumber, y + self.stateSelfReferenceNumber]
            ]);
    };

    /**
     * Crossproduct helper function
     * @param   {object}   a vector
     * @param   {object}   b vector
     * @returns {object}   crossproduct vetor 
     */
    function crossPro(a, b) {

        var vecC = {
            x: a.y * b.z,
            y: -a.x * b.z

        };
        return vecC;
    }

    function toDegrees(angle) {
        return angle * (180 / Math.PI);
    }

    function toRadians(angle) {
        return angle * (Math.PI / 180);
    }

    /**
     * expands a vector with a given factor
     * @param   {object} a      vector
     * @param   {number} factor expandfactor
     * @returns {object} expanded vector
     */
    function expandVector(a, factor) {
        return {
            x: a.x * factor,
            y: a.y * factor
        };
    }

    function fixVectorLength(a) {
        var tmp = 1 / Math.sqrt(a.x * a.x + a.y * a.y);
        return {
            x: a.x * tmp,
            y: a.y * tmp

        };
    }

    function AngleBetweenTwoVectors(a, b) {
        var tmp = (a.x * b.x + a.y * b.y) / (Math.sqrt(a.x * a.x + a.y * a.y) * Math.sqrt(b.x * b.x + b.y * b.y));
        var tmp2 = Math.acos(tmp);
        return {
            val: tmp,
            rad: tmp2,
            degree: toDegrees(tmp2)
        };
    }

    function newAngle(a, b) {
        var dot1 = a.x * b.x + a.y * b.y; //dot product
        var dot2 = a.x * b.y - a.y * b.x; //determinant
        return Math.atan2(dot2, dot1); //atan2(y, x) or atan2(sin, cos)
    }

    var degreeConstant = 30;

    function getAngles(a, b) {
        var angle = toDegrees(newAngle(a, b));
        if (angle < 0) {
            angle = angle + 360;
        }

        var upperAngle = angle + degreeConstant;
        if (upperAngle > 360) {
            upperAngle -= 360;
        }
        var lowerAngle = angle - degreeConstant;
        if (lowerAngle < 0) {
            lowerAngle += 360;
        }

        return {
            angle: angle,
            lowerAngle: lowerAngle,
            upperAngle: upperAngle
        };
    }

    //Get the Path from an array -> for the transition
    self.bezierLine = d3.svg.line()
        .x(function (d) {
            return d[0];
        })
        .y(function (d) {
            return d[1];
        })
        .interpolate("basis");

    /**
     * Returns the transitionDrawConfig with all the data like xstart, xend, xtext....
     * @param   {object}  transition    the transitionobj
     * @param   {boolean} forceApproach if we force an approachedtransition ->needed when the transition was writed to the array, or for the addtransition
     * @returns {object}  the drawConfig
     */
    self.getTransitionDrawConfig = function (transition, forceApproach) {
        //the distance the endPoint of the transition is away from the state
        var gapBetweenTransitionLineAndState = 3;
        var obj = {};

        /**1: Check if there is a transition aproach our transition**/
        obj.approachTransition = forceApproach || self.existsDrawnTransition(transition.toState, transition.fromState);

        /****2. Get the xStart,yStart and xEnd,yEnd  and xMid,yMid***/
        //from and to State
        var fromState = $scope.getStateById(transition.fromState);
        var toState = $scope.getStateById(transition.toState);
        var isToStateAFinalState = $scope.isStateAFinalState(transition.toState);
        //the x and y coordinates
        var x1 = fromState.x;
        var y1 = fromState.y;
        var x2 = toState.x;
        var y2 = toState.y;

        var xCurv1,
            yCurv1,
            xCurv2,
            yCurv2;

        //needed for the calculation of the coordinates
        var directionvector = {
            x: x2 - x1,
            y: y2 - y1
        };
        var directionVectorLength = Math.sqrt(directionvector.x * directionvector.x + directionvector.y * directionvector.y);
        var nStart = self.settings.stateRadius / directionVectorLength;
        var nEnd;
        if (isToStateAFinalState) {
            nEnd = (self.settings.stateRadius + gapBetweenTransitionLineAndState + 5) / directionVectorLength;
        } else {
            nEnd = (self.settings.stateRadius + gapBetweenTransitionLineAndState) / directionVectorLength;
        }

        obj.xStart = x1 + nStart * directionvector.x;
        obj.yStart = y1 + nStart * directionvector.y;

        obj.xEnd = x2 - nEnd * directionvector.x;
        obj.yEnd = y2 - nEnd * directionvector.y;
        obj.xDiff = x2 - x1;
        obj.yDiff = y2 - y1;
        obj.xMid = (x1 + x2) / 2;
        obj.yMid = (y1 + y2) / 2;
        obj.distance = Math.sqrt(obj.xDiff * obj.xDiff + obj.yDiff * obj.yDiff);
        /**3: Calc the CurvedPoint**/
        //BETTER ONLY CALC WHEN obj.approachTransition = true;
        var vecA = {
            x: obj.xMid - obj.xStart,
            y: obj.yMid - obj.yStart,
            z: 0
        };

        var vecB = {
            x: 0,
            y: 0,
            z: 1
        };


        var vecX = {
            x: 1,
            y: 0,
            z: 0
        };



        var stretchValue, movingPoint;
        //OLD:stretchValue = (70 * (1 / obj.distance * 1.1) * 1.4);
        stretchValue = 20;

        movingPoint = crossPro(vecA, vecB);
        movingPoint = fixVectorLength(movingPoint);

        movingPoint = expandVector(movingPoint, stretchValue);

        /**4:Calc the curvestart and end if there is and approach transition**/
        if (obj.approachTransition) {

            var xStart = getAngles({
                x: obj.xStart - x1,
                y: obj.yStart - y1
            }, {
                x: self.settings.stateRadius,
                y: 0
            });

            var xEnd = getAngles({
                x: obj.xEnd - x2,
                y: obj.yEnd - y2
            }, {
                x: self.settings.stateRadius,
                y: 0
            });

            obj.xStart = x1 + (self.settings.stateRadius * Math.cos(toRadians(xStart.upperAngle)));
            obj.yStart = y1 - (self.settings.stateRadius * Math.sin(toRadians(xStart.upperAngle)));

            obj.xEnd = x2 + (self.settings.stateRadius * Math.cos(toRadians(xEnd.lowerAngle)));
            obj.yEnd = y2 - (self.settings.stateRadius * Math.sin(toRadians(xEnd.lowerAngle)));
        }

        //OLD:stretchValue = (70 * (1 / obj.distance * 1.1) * 1.4);
        stretchValue = 35;

        movingPoint = crossPro(vecA, vecB);
        movingPoint = fixVectorLength(movingPoint);
        movingPoint = expandVector(movingPoint, stretchValue);
        obj.xMidCurv = movingPoint.x + obj.xMid;
        obj.yMidCurv = movingPoint.y + obj.yMid;


        /**5:Calc the textposition**/
        var existsDrawnTrans = self.existsDrawnTransition(fromState.id, toState.id);
        var drawnTrans = self.getDrawnTransition(fromState.id, toState.id);
        var transNamesLength;
        if (drawnTrans) {
            transNamesLength = drawnTrans.names.length;
        } else {
            transNamesLength = 1;
        }
        var angleAAndX = AngleBetweenTwoVectors(vecA, vecX);

        var textStretchValue, textPoint;
        var textAngle = angleAAndX.degree;
        if (textAngle > 90) {
            textAngle = 90 - (textAngle % 90);
        }
        var x = Math.pow((textAngle / 90), 1 / 2);

        if (obj.approachTransition) {
            textStretchValue = (40 + (8 * transNamesLength) * x);
        } else {
            textStretchValue = (12 + (transNamesLength * 8) * x);
        }


        textPoint = crossPro(vecA, vecB);
        textPoint = fixVectorLength(textPoint);
        textPoint = expandVector(textPoint, textStretchValue);

        obj.xText = textPoint.x + obj.xMid;
        obj.yText = textPoint.y + obj.yMid;


        /**6:Calc the path**/
        var array = [];
        if (obj.approachTransition) {
            array = [
                [obj.xStart, obj.yStart],
                [obj.xMidCurv, obj.yMidCurv],
                [obj.xEnd, obj.yEnd]
            ];
        } else {
            array = [
                [obj.xStart, obj.yStart],
                [obj.xEnd, obj.yEnd]
            ];
        }
        obj.path = self.bezierLine(array);
        return obj;
    };

    /**
     * Adds the transition names to the text of a transition
     * @param {object} textObj the transition textObjReference
     * @param {array}  names   the names array of the transition
     */
    self.writeTransitionText = function (textObj, names) {
        textObj.selectAll("*").remove();
        for (var i = 0; i < names.length; i++) {
            //fix when creating new transition when in animation
            if ($scope.simulator.animated.transition !== null && names[i].id === $scope.simulator.animated.transition.id) {
                textObj.append('tspan').attr('transition-id', names[i].id).text(names[i].name).classed("animated-transition-text", true);
            } else {
                textObj.append('tspan').attr('transition-id', names[i].id).text(names[i].name);
            }

            if (i < names.length - 1)
                textObj.append('tspan').text(' | ');
        }


    };

    /**
     * Draw a Transition
     * @param  {number} id 
     * @return {object}  Retruns the reference of the group object
     */
    self.drawTransition = function (transitionId) {
        var transition = $scope.getTransitionById(transitionId);
        //if there is not a transition with the same from and toState
        if (!self.existsDrawnTransition(transition.fromState, transition.toState)) {
            //the group element
            var group = self.svgTransitions.append("g")
                .attr("class", "transition"),
                //the line itself with the arrow
                lineSelection = group.append("path")
                .attr("class", "transition-line-selection")
                .attr("fill", "none")
                .attr("marker-end", "url(#marker-end-arrow-selection)"),
                line = group.append("path")
                .attr("class", "transition-line")
                .attr("fill", "none")
                .attr("marker-end", "url(#marker-end-arrow)"),

                lineClickArea = group.append("path")
                .attr("class", "transition-line-click")
                .attr("stroke-width", 20)
                .attr("stroke", "transparent")
                .attr("fill", "none"),
                lineHover = group.append("path")
                .attr("class", "transition-line-hover")
                .attr("fill", "none")
                .attr("marker-end", "url(#marker-end-arrow-hover)"),
                //the text of the transition
                text = group.append("text")
                .attr("class", "transition-text")
                .attr("dominant-baseline", "central")
                .attr("fill", "black");
            //if it is not a self Reference
            if (transition.fromState != transition.toState) {
                var drawConfig = self.getTransitionDrawConfig(transition);
                //if there is an approached transition update the approached transition
                if (drawConfig.approachTransition) {
                    //other transition in the other direction
                    var otherTrans = self.getDrawnTransition(transition.toState, transition.fromState);
                    var otherTransdrawConfig = self.getTransitionDrawConfig(otherTrans, true);
                    self.updateTransitionLines(otherTrans.objReference, otherTransdrawConfig.path);
                    //update the transition text position
                    otherTrans.objReference.select(".transition-text")
                        .attr("x", (otherTransdrawConfig.xText))
                        .attr("y", (otherTransdrawConfig.yText));
                }
                //draw the text
                text.attr("class", "transition-text")
                    .attr("x", (drawConfig.xText))
                    .attr("y", (drawConfig.yText));
                self.updateTransitionLines(group, drawConfig.path);

                //if it is a selfreference
            } else {
                var stateId = $scope.getArrayStateIdByStateId(transition.fromState);
                var x = $scope.config.states[stateId].x;
                var y = $scope.config.states[stateId].y;

                self.updateTransitionLines(group, self.selfTransition(x, y));
                text.attr("x", x - self.settings.stateRadius - 50)
                    .attr("y", y);
            }
            //add the drawnTransition
            group.attr("object-id", $scope.config.drawnTransitions.push({
                fromState: transition.fromState,
                toState: transition.toState,
                names: [{
                    "id": transition.id,
                    "name": transition.name
                }],
                objReference: group
            }) - 1);
            self.writeTransitionText(text, self.getDrawnTransition(transition.fromState, transition.toState).names);
            group.attr("from-state-id", transition.fromState)
                .attr("to-state-id", transition.toState)
                .on('click', self.openTransitionMenu)
                .on("mouseover", function () {
                    d3.select(this).select('.transition-line-hover').attr("style", "opacity:0.6");
                }).on("mouseleave", function () {
                    d3.select(this).select('.transition-line-hover').attr("style", "");
                });
            return group;
            //if there is already a transition with the same fromState and toState then the current
        } else {
            //add the name to the drawnTransition
            var drawnTransition = self.getDrawnTransition(transition.fromState, transition.toState);
            drawnTransition.names.push({
                "id": transition.id,
                "name": transition.name
            });
            //drawn the new name to the old transition (svg)
            self.writeTransitionText(drawnTransition.objReference.select('.transition-text'), self.getDrawnTransition(transition.fromState, transition.toState).names);
            var drawConfigNew = self.getTransitionDrawConfig(transition);
            drawnTransition.objReference.select('.transition-text')
                .attr("x", (drawConfigNew.xText))
                .attr("y", (drawConfigNew.yText));

        }
    };

    /**
     * helper function updates all the transition lines
     * @param {object}   transitionobjReference
     * @param {string}   path                   
     */
    self.updateTransitionLines = function (transitionobjReference, path) {
        transitionobjReference.select(".transition-line").attr("d", path);
        transitionobjReference.select(".transition-line-selection").attr("d", path);
        transitionobjReference.select(".transition-line-hover").attr("d", path);
        transitionobjReference.select(".transition-line-click").attr("d", path);
    };

    /**
     * opens the transitionmenu
     * @param {number} transitionId when there is a transitionId we open the transitionmenu with the given id
     */
    self.openTransitionMenu = function (transitionId) {
        self.closeStateMenu();
        self.closeTransitionMenu();
        self.preventSvgOuterClick = true;
        self.showTransitionMenu = true;

        var fromState, toState;
        if (transitionId === undefined) {
            fromState = d3.select(this).attr('from-state-id');
            toState = d3.select(this).attr('to-state-id');
            self.selectedTransition = self.getDrawnTransition(fromState, toState);
        } else {
            var tmpTransition = $scope.getTransitionById(transitionId);
            fromState = tmpTransition.fromState;
            toState = tmpTransition.toState;
            self.selectedTransition = self.getDrawnTransition(fromState, toState);
        }

        self.selectedTransition.objReference.classed("active", true);

        self.input = {};
        self.input.fromState = $scope.getStateById(fromState);
        self.input.toState = $scope.getStateById(toState);
        self.input.transitions = [];


        _.forEach(self.selectedTransition.names, function (value, key) {
            var tmpObject = {};
            tmpObject = cloneObject(value);

            if (transitionId !== undefined) {
                if (value.id == transitionId) {
                    tmpObject.isFocus = true;
                }
            } else if (self.selectedTransition.names.length - 1 === key) {
                tmpObject.isFocus = true;

            }
            //add other variables
            tmpObject.ttt = "";
            tmpObject.tttisopen = false;
            self.input.transitions.push(tmpObject);
        });

        self.transitionMenuListener = [];

        /*jshint -W083 */
        for (var i = 0; i < self.input.transitions.length; i++) {
            self.transitionMenuListener.push($scope.$watchCollection("statediagram.input.transitions['" + i + "']", function (newValue, oldValue) {
                if (newValue.name !== oldValue.name) {
                    newValue.tttisopen = false;
                    if (newValue.name !== "" && !$scope.existsTransition(fromState, toState, newValue.name)) {
                        $scope.renameTransition(newValue.id, newValue.name);
                    } else if (newValue.name === "") {
                        newValue.tttisopen = true;
                        newValue.ttt = 'TRANS_MENU.NAME_TOO_SHORT';
                    } else if ($scope.existsTransition(fromState, toState, newValue.name, newValue.id)) {
                        newValue.tttisopen = true;
                        newValue.ttt = 'TRANS_MENU.NAME_ALREAD_EXISTS';
                    }
                    console.log(($scope.existsTransition(fromState, toState, newValue.name, newValue.id)));
                }
            }));
        }


        $scope.safeApply();

    };

    /**
     * closes the transitionmenu
     */
    self.closeTransitionMenu = function () {
        _.forEach(self.transitionMenuListener, function (value, key) {
            value();
        });
        self.showTransitionMenu = false;
        if (self.selectedTransition !== null) {
            self.selectedTransition.objReference.classed("active", false);
            self.selectedTransition = null;

        }
    };

    /**
     * Update the transitions in the svg after moving a state
     * @param  {number} stateId Moved stateId
     */
    self.updateTransitionsAfterStateDrag = function (stateId) {
        var stateName = $scope.config.states[$scope.getArrayStateIdByStateId(stateId)].name;
        _.forEach($scope.config.drawnTransitions, function (n, key) {
            if (n.fromState == stateId || n.toState == stateId) {
                //if its not a selfreference
                var obj = n.objReference,
                    transitionText = obj.select("text");
                if (n.fromState != n.toState) {
                    var drawConfig = self.getTransitionDrawConfig(n);
                    //if there is a transition in the other direction
                    self.updateTransitionLines(obj, drawConfig.path);
                    transitionText.attr("x", drawConfig.xText).attr("y", drawConfig.yText);
                } else {
                    var moveStateId = n.fromState;
                    var x = $scope.config.states[$scope.getArrayStateIdByStateId(moveStateId)].x;
                    var y = $scope.config.states[$scope.getArrayStateIdByStateId(moveStateId)].y;
                    //update Transistion with self reference
                    self.updateTransitionLines(obj, self.selfTransition(x, y));
                    transitionText.attr("x", x - self.settings.stateRadius - 50).attr("y", y);
                }
            }
        });
    };

    /**************
     **SIMULATION**
     *************/


    $scope.$watch('simulator.animated.currentState', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            console.log("CURRENTSTATE:oldValue " + oldValue + " newvalue " + newValue);
            console.log("status" + $scope.simulator.status);
            if (oldValue !== null) {
                self.setStateClassAs(oldValue, false, "animated-currentstate-svg");
                self.setStateClassAs(oldValue, false, "animated-accepted-svg");
                self.setStateClassAs(oldValue, false, "animated-not-accepted-svg");

            }
            if (newValue !== null) {
                if ($scope.simulator.status === "accepted") {
                    self.setStateClassAs($scope.simulator.animated.currentState, true, "animated-accepted-svg");
                } else if ($scope.simulator.status === "not accepted") {
                    self.setStateClassAs($scope.simulator.animated.currentState, true, "animated-not-accepted-svg");
                } else {
                    self.setStateClassAs(newValue, true, "animated-currentstate-svg");
                }
            }
        }
    });

    $scope.$watch('simulator.animated.transition', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            if (oldValue !== null) {
                self.setTransitionClassAs(oldValue.id, false, "animated-transition");
                d3.selectAll("[transition-id='" + oldValue.id + "'").classed("animated-transition-text", false);
                //remove transitionname animation
            }
            if (newValue !== null) {
                self.setTransitionClassAs(newValue.id, true, "animated-transition");
                console.log(newValue);
                d3.selectAll("[transition-id='" + newValue.id + "'").classed("animated-transition-text", true);
                //animate transitionname
            }
        }
    });

    $scope.$watch('simulator.animated.nextState', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            console.log("NEXTSTATE: oldValue " + oldValue + " newvalue " + newValue);
            if (oldValue !== null) {
                self.setStateClassAs(oldValue, false, "animated-nextstate-svg");
            }
            if (newValue !== null) {
                self.setStateClassAs(newValue, true, "animated-nextstate-svg");
            }
        }
    });
    $scope.$watch('simulator.status', function (newValue, oldValue) {
        if (newValue !== oldValue) {
            if ($scope.simulator.status === "accepted") {
                self.setStateClassAs($scope.simulator.animated.currentState, true, "animated-accepted-svg");
            } else if ($scope.simulator.status === "not accepted") {
                self.setStateClassAs($scope.simulator.animated.currentState, true, "animated-not-accepted-svg");
            }
        }

    });
}