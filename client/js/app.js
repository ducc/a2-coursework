/* global phaser Client Type Player */

let ready = false;
let player;
let worldGravity;
const players = new Map();

// creating a new Client instance
const client = new Client();
// registering the hi handler
client.handlers[Type.Message.HI] = function(json) {
    // sending the hello response
    client.sendHello();
};
// registering the welcome handler
client.handlers[Type.Message.WELCOME] = function(json) {
    const id = json[1];
    const x = json[2];
    const y = json[3];
    const health = json[4];
    worldGravity = json[5];
    player = new Player(id, x, y, health);
    phaser.camera.follow(player.sprite);
    ready = true;
    console.log("Handshake completed! ID: " + id);
};
// move response handler
client.handlers[Type.Message.MOVE] = function(json) {
    if (!ready) {
        return;
    }
    const playerId = json[1];
    const action = json[2];
    const velocity = json[3];
    const x = json[4];
    const y = json[5];
    
    // getting the player instance for the id
    let p;
    if (playerId == player.id) {
        p = player;
    } else {
        if (!players.has(playerId)) {
            return;
        }
        p = players.get(playerId);
    }
    
    // updating the player location
    p.sprite.x = x;
    p.sprite.y = y;
    
    // setting velocities and animations
    switch (action) {
        case Type.Action.STOP:
            p.velocity.x = velocity;
            p.velocity.y = velocity;
            p.stopAnimations();
            break;
        case Type.Action.LEFT:
            p.velocity.x = velocity;
            p.playAnimation(Type.Animation.LEFT);
            break;
        case Type.Action.RIGHT:
            p.velocity.x = velocity;
            p.playAnimation(Type.Animation.RIGHT);
            break;
        case Type.Action.JUMP:
            p.velocity.y = velocity;
            break;
    }
};
// player join handler
client.handlers[Type.Message.JOIN] = function(json) {
    const id = json[1];
    const x = json[2];
    const y = json[3];
    const health = json[4];
    players.set(id, new Player(id, x, y, health));
};

// function called when phaser is ready to connect to the websocket
phaser.ready = function() {
    client.connect("schoolproject-jb5959.c9users.io", "80");
};