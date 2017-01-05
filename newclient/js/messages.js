/* global Client Type */

Client.prototype.sendHello = function() {
    this.sendMessage([Type.Message.HELLO]);
};

Client.prototype.sendMove = function(action) {
    this.sendMessage([Type.Message.MOVE_REQUEST, action]);
}