autoSim.Terminal = function (id, posX, posY, char, leftId) {
    var self = this;

    self.id = id;
    self.posX = posX;
    self.posY = posY;
    self.char = char;
};
autoSim.Terminal.prototype = Array.prototype;