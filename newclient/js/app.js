/* global phaser Client Type Player */

let ready = false;
let player;
const players = new Map();

const client = new Client();
client.handlers[Type.Message.HI] = function(json) {
    client.sendHello();
};
client.handlers[Type.Message.WELCOME] = function(json) {
    const id = json[1];
    const x = json[2];
    const y = json[3];
    const health = json[4];
    player = new Player(id, x, y, health);
    phaser.camera.follow(player.sprite);
    ready = true;
    console.log("Handshake completed! ID: " + id);
};
client.handlers[Type.Message.MOVE] = function(json) {
    if (!ready) {
        return;
    }
    const playerId = json[1];
    const action = json[2];
    const velocity = json[3];
    const x = json[4];
    const y = json[5];
    
    let p;
    if (playerId == player.id) {
        p = player;
    } else {
        if (!players.has(playerId)) {
            return;
        }
        p = players.get(playerId);
    }
    
    p.sprite.x = x;
    p.sprite.y = y;
    
    //const deltaTime = (phaser.time.elapsedMS * phaser.time.fps) / 1000;
    //player.sprite.body.velocity.x = velocity * deltaTime;
    
    p.sprite.body.velocity.x = velocity;
    
    switch (action) {
        case Type.Action.STOP:
            p.stopAnimations();
            break;
        case Type.Action.LEFT:
            p.playAnimation("left");
            break;
        case Type.Action.RIGHT:
            p.playAnimation("right");
            break;
        case Type.Action.JUMP:
            break;
    }
};
client.handlers[Type.Message.JOIN] = function(json) {
    const id = json[1];
    const x = json[2];
    const y = json[3];
    const health = json[4];
    players.set(id, new Player(id, x, y, health));
};

phaser.ready = function() {
    client.connect("schoolproject-jb5959.c9users.io", "80");
};