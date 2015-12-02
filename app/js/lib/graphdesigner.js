"use strict";


//GRAPHDESIGNER
var GraphDesigner = function(style, svgSelector) {
    var self = this;

    //graphdesigner settings
    self.settings = {
        nodeRadius: 25,
        selected: false
    };
    self.svgOuter = d3.select(svgSelector);
    self.svg = self.svgOuter.call(d3.behavior.zoom().on("zoom", function() {
            if (!self.settings.selected) {
                self.svg.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
            }
        }))
        .append("g").attr("id", "svg-items");

    //first draw the transitions -> nodes are in front of them if they overlap
    self.svgTransitions = self.svg.append("g").attr("id", "transitions");
    self.svgNodes = self.svg.append("g").attr("id", "nodes");


    //DEFS
    self.defs = self.svg.append('svg:defs');
    //Marker-Arrow
    self.defs.append('svg:marker')
        .attr('id', 'marker-end-arrow')
        .attr('refX', 8)
        .attr('refY', 3)
        .attr('markerWidth', 10)
        .attr('markerHeight', 10)
        .attr('orient', 'auto')
        .append('svg:path')
        .attr('d', 'M0,0 L0,6 L9,3 z');


    //Node,Transition ect
    self.node = {};
    self.node.start = null;
    self.node.end = null;
    self.node.nodes = [];
    self.transitions = [];


    //check if there is an other node with the given name
    self.isNodeNameUnique = function(name) {
        var tmp = true;
        _.forEach(self.node.nodes, function(node) {
            if (node.name == name)
                return tmp = false;
        });
        return tmp;
    }

    //check if a node exist with the given name
    self.existsNodeWithName = function(name) {
        var tmp = false;
        _.forEach(self.node.nodes, function(node) {
            if (node.name == name)
                return tmp = true;
        })
        return tmp;
    }
    


    //get a node id with the given name
    self.getNodeIdByName = function(name) {
        var tmp = null;
        _.forEach(self.node.nodes, function(node, key) {
            if (node.name == name) {
                tmp = key;
            }
        });
        if (tmp != null)
            return tmp;
        else {
            console.log("Cant find a node with this name");
            return null;
        }
    }

    //Checks if a node has a transition
    self.nodeHasTransitions = function(name) {
        //before we checked if the node exist ? ERRROR CHECK IN THIS FUNCITON?
        var tmp = false;
        _.forEach(self.transitions, function(transition) {
            if (transition.from == name || transition.to == name)
                return tmp = true;
        });
        return tmp;
    }

    //get the node svg item
    self.getNodeItem = function(id) {
        var nodeItem = self.svgNodes.select(id);
        console.log(nodeItem);
    }

    //Add a Node
    self.addNode = function(x, y, name) {
        if (self.isNodeNameUnique(name)) {
            self.node.nodes.push({
                "name": name,
                "x": x,
                "y": y
            });
            self.drawNode(self.node.nodes.length - 1);
            self.callNodeListener();
        } else {
            console.log("The nodeName already exists!");
        }
    };


    //rename the node with the given name with a new name
    self.renameNode = function(name, newname) {
        var node = _.where(self.node.nodes, {'name': name});

        if(node==undefined){
          console.log("didnt renameNode error");
        }else{
          node.name = newname;
          var transitions
          _.each(['from', 'to'], function(direction){
            transitions = _.where(self.transitions, {direction: name})
            _.each(transitions, function(trnasition){
              transition[direction] = newName;
            });
          });
        }
    }

    //remove a Node if exist
    self.removeNode = function(name) {
        if (self.existsNodeWithName(name)) {
            if (!self.nodeHasTransitions(name)) {

            } else {
                console.log("NODE HAS Trannsitions")
            }
        } else {
            console.log("Node doesnt exist");
        }
    }

    //draw the node with the id on the svg
    self.drawNode = function(id) {
        var node = self.node.nodes[id];
        var group = self.svgNodes.append("g")
            .attr("transform", "translate(" + node.x + " " + node.y + ")")
            .attr("class", "node")
            .attr("object-id", id);

        var circleSelection = group.append("circle")
            .attr("class", "node-circle")
            .attr("r", self.settings.nodeRadius);

        var text = group.append("text")
            .text(node.name)
            .attr("class", "node-text")
            .attr("dominant-baseline", "central")
            .attr("text-anchor", "middle");

        self.node.nodes[id].objReference = group;
        return group;
    }

    //draw all the nodes
    self.drawNodes = function() {
        _.forEach(self.node.nodes, function(node, key) {
            self.drawNode(key);
        });
    }

    //Node drag and drop behaviour
    self.dragNode = d3.behavior.drag()
        .on("dragstart", function() {
            self.settings.selected = true;
        })
        .on("drag", function() {
            //update the shown node
            d3.select(this)
                .attr("transform", "translate(" + d3.event.x + " " + d3.event.y + ")")
                .attr("x", d3.event.x);
            //update the node in the array
            self.node.nodes[d3.select(this).attr("object-id")].x = d3.event.x;
            self.node.nodes[d3.select(this).attr("object-id")].y = d3.event.y;
            //update the transitions after dragging a node
            self.updateTransitionsAfterNodeDrag(d3.select(this).attr("object-id"));
        })
        .on("dragend", function() {
            self.settings.selected = false;
        });

    //check if a transition exists
    self.existTransition = function(from, to, name) {
        for (var i = 0; i < self.transitions.length; i++) {
            if (self.transitions[i].name == name && self.transitions[i].from == from && self.transitions[i].to == to) {
                return true;
            }

        }
        return false;
    }

    //add a transition
    self.addTransition = function(from, to, name) {
        if (self.existsNodeWithName(from) && self.existsNodeWithName(to)) {
            if (!self.existTransition(from, to, name)) {
                self.transitions.push({
                    "name": name,
                    "from": from,
                    "to": to
                });
                self.drawTransition(self.transitions.length - 1);
            } else {
                console.log("the transition already exist")
            }
        } else {
            console.log("The nodes doesnt exist");
        }
    };

    //remove a transition
    self.removeTransition = function(from, to, name) {
        var tmp = true;
        _.forEach(self.transitions, function(transition, id) {
            if (transition.from == from && transition.to == to && transition.name == name) {
                tmp = true;
                console.log("NAMNE" + name + "From" + from)
                    //remove the transition
                console.log(transition);

            }

        });
        if (!tmp) {
            console.log("DIDNT found transition")
        }
    }

    //draw the transition with the id
    self.drawTransition = function(id) {

        var transition = self.transitions[id];
        var fromId = self.getNodeIdByName(transition.from);
        var toId = self.getNodeIdByName(transition.to);
        var x1 = self.node.nodes[fromId].x;
        var y1 = self.node.nodes[fromId].y;
        var x2 = self.node.nodes[toId].x;
        var y2 = self.node.nodes[toId].y;
        var richtungsvektor = {
            "x": x2 - x1,
            "y": y2 - y1
        };
        var richtungsVectorLength = Math.sqrt(richtungsvektor.x * richtungsvektor.x + richtungsvektor.y * richtungsvektor.y);
        var n = self.settings.nodeRadius / richtungsVectorLength;
        var x3 = x1 + n * richtungsvektor.x;
        var y3 = y1 + n * richtungsvektor.y;
        var x4 = x2 - n * richtungsvektor.x;
        var y4 = y2 - n * richtungsvektor.y;

        var group = self.svgTransitions.append("g")
            .attr("transform", "translate(" + x3 + " " + y3 + ")")
            .attr("class", "transition");

        var line = group.append("line")
            .attr("class", "transition-line")
            .attr("x2", x4 - x3)
            .attr("y2", y4 - y3)
            .attr("marker-end", "url(#marker-end-arrow)");

        var text = group.append("text")
            .attr("class", "transition-text")
            .text(transition.name)
            .attr("x", (x4 - x3) / 2)
            .attr("y", (y4 - y3) / 2);


        self.transitions[id].objReference = group;
        return group;
    }



    //draw all the transitions
    self.drawTransitions = function() {
        _.forEach(self.transitions, function(n, key) {
            self.drawTransition(key);

        });
    }

    //update the transitions when a node is moved
    self.updateTransitionsAfterNodeDrag = function(nodeId) {
        var nodeName = self.node.nodes[nodeId].name;
        _.forEach(self.transitions, function(n, key) {
            if (n.from == nodeName || n.to == nodeName) {
                var obj = n.objReference;
                var fromId = self.getNodeIdByName(n.from);
                var toId = self.getNodeIdByName(n.to);
                var x1 = self.node.nodes[fromId].x;
                var y1 = self.node.nodes[fromId].y;
                var x2 = self.node.nodes[toId].x;
                var y2 = self.node.nodes[toId].y;
                var richtungsvektor = {
                    "x": x2 - x1,
                    "y": y2 - y1
                };
                var richtungsVectorLength = Math.sqrt(richtungsvektor.x * richtungsvektor.x + richtungsvektor.y * richtungsvektor.y);
                var n = self.settings.nodeRadius / richtungsVectorLength;
                var x3 = x1 + n * richtungsvektor.x;
                var y3 = y1 + n * richtungsvektor.y;
                var x4 = x2 - n * richtungsvektor.x;
                var y4 = y2 - n * richtungsvektor.y;

                obj.attr("transform", "translate(" + x3 + " " + y3 + ")");

                obj.select("line")
                    .attr("x2", x4 - x3)
                    .attr("y2", y4 - y3);

                obj.select("text")
                    .attr("x", (x4 - x3) / 2)
                    .attr("y", (y4 - y3) / 2);
            }

        });
    }

    //download graph
    self.download = function() {

    }

    //BETTER SOLUTION THIS IN THE OBJECT ..
    self.callNodeListener = function eventListener() {
        d3.selectAll(".node").call(myGraphDesigner.dragNode);
    }
}
