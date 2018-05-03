// the Client class
const Client = function() {
    this.connection = null;
    this.handlers = [];
    this.lastMessage = null;
};

// connects to a websocket on the specified host and port
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
    
    // when a message is received pass the data to the receiveMessage function
    this.connection.onmessage = (event) => {
        this.receiveMessage(event.data);
    };
};

// sends a message from the client to the server
Client.prototype.sendMessage = function(data) {
    // the ready state indicates if the websocket is ready to send messages
    if (this.connection.readyState === 1) {
        const json = JSON.stringify(data);
        
        // checking the cached last message to see if it is the same
        if (this.lastMessage != null && this.lastMessage === json) {
            return;
        }
        this.lastMessage = json;
        this.connection.send(json);
    }
};

// invokes the handler for a received json message
Client.prototype.receiveMessage = function(data) {
    const json = JSON.parse(data);
    this.handlers[json[0]](json);
};