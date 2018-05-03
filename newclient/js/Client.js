/* global Msg */

var Client = function() {
    this.conn = null;
    this.lastMsg = null;
    this.handlers = [];
};

Client.prototype.open = function(host, port) {
    var client = this;
    this.conn = new WebSocket("ws://" + host + ":" + port + "/gateway");
    this.conn.onopen = function(event) {
        console.log("Connected!");
    };
    this.conn.onclose = function(event) {
        console.log("Closed!");
    };
    this.conn.onerror = function(event) {
        console.log("Error! " + event);
    };
    this.conn.onmessage = function(event) {
        var json = JSON.parse(event.data);
        client.handlers[json[0]](json);
    };
};

Client.prototype.send = function(data) {
    if (this.conn.readyState === 1) {
        if (this.lastMsg != null && this.lastMsg === data) {
            return;
        }
        this.lastMsg = data;
        this.conn.send(JSON.stringify(data));
    }
};