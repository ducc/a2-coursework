/* global Client Type */

// sends the hello message
Client.prototype.sendHello = function() {
    this.sendMessage([Type.Message.HELLO]);
};

// sends a move request message
Client.prototype.sendMove = function(action) {
    this.sendMessage([Type.Message.MOVE_REQUEST, action]);
}