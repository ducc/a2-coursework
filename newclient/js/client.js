const Client = function() {
    this.connection = null;
    this.handlers = [];
    this.lastMessage = null;
};

Client.prototype.connect = function(host, port) {
    const url = "ws://" + host + ":" + port + "/gateway";
    this.connection = new WebSocket(url);
    this.connection.onopen = (event) => {
        console.log("Connected to " + url);
    };
    this.connection.onclose = (event) => {
        console.log("Connection closed!");
    };
    this.connection.onerror = (event) => {
        console.log("Error at websocket: " + event);
    };
    this.connection.onmessage = (event) => {
        this.receiveMessage(event.data);
    };
};

Client.prototype.sendMessage = function(data) {
    if (this.connection.readyState === 1) {
        const json = JSON.stringify(data);
        if (this.lastMessage != null && this.lastMessage === json) {
            return;
        }
        this.lastMessage = json;
        this.connection.send(json);
    }
};

Client.prototype.receiveMessage = function(data) {
    const json = JSON.parse(data);
    this.handlers[json[0]](json);
};