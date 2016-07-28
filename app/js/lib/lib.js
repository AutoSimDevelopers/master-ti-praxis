//FROM http://stackoverflow.com/questions/10151216/javascript-cloned-object-looses-its-prototype-functions
function cloneObject(obj) {
    obj = obj && obj instanceof Object ? obj : '';

    // Handle Date (return new Date object with old value)
    if (obj instanceof Date) {
        return new Date(obj);
    }

    // Handle Array (return a full slice of the array)
    if (obj instanceof Array) {
        return obj.slice();
    }

    // Handle Object
    if (obj instanceof Object) {
        var copy = new obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) {
                if (obj[attr] instanceof Object) {
                    copy[attr] = cloneObject(obj[attr]);
                } else {
                    copy[attr] = obj[attr];
                }
            }
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

//Constructor for state
function State(id, name, x, y) {
    var self = this;
    self.id = id;
    self.name = name;
    self.x = x;
    self.y = y;

}

function TransitionDFA(id, fromState, toState, transitionchar) {
    var self = this;
    self.id = id;
    self.fromState = fromState;
    self.name = transitionchar;
    self.toState = toState;
}


function TransitionPDA(id, fromState, toState, transitionChar, beforeStack, afterStack) {
    var self = this;
    self.id = id;
    self.fromState = fromState;
    self.toState = toState;
    self.name = transitionChar;
    self.beforeStack = beforeStack;
    self.afterStack = afterStack;
}