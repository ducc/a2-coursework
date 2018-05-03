/* global Phaser player ready Type client players PLAYER_JUMP_VELOCITY worldGravity */

let platforms;

// creating a new phaser game
const phaser = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, " ", {
    preload: preload,
    create: create,
    update: update,
});

// this function loads all the game resources before creating it
function preload() {
    phaser.load.image("sky", "img/sky.png");
    phaser.load.image("platform", "img/platform.png");
    phaser.load.spritesheet("dude", "img/dude.png", 32, 48);
}

// creates the game world
function create() {
    createKeys();
    
    phaser.stage.disableVisibilityChange = true;
    phaser.time.advancedTiming = true;
    
    const physics = phaser.physics;
    physics.startSystem(Phaser.Physics.ARCADE);
    
    createWorld();
    createUI();
    
    // this function begins the websocket connection
    phaser.ready();
}
// loading the input keys
function createKeys() {
    const cursors = phaser.input.keyboard.createCursorKeys();
    phaser.keys = {
        w: phaser.input.keyboard.addKey(Phaser.Keyboard.W),
        s: phaser.input.keyboard.addKey(Phaser.Keyboard.S),
        a: phaser.input.keyboard.addKey(Phaser.Keyboard.A),
        d: phaser.input.keyboard.addKey(Phaser.Keyboard.D),
        up: cursors.up,
        down: cursors.down,
        left: cursors.left,
        right: cursors.right,
        space: phaser.input.keyboard.addKey(32)
    }
}
// creating the world & environment
function createWorld() {
    const world = phaser.world;
    world.setBounds(0, 0, 3000, 1000);
    
    const add = phaser.add;
    const sky = add.sprite(0, 0, "sky");
    sky.width = world.width;
    sky.height = world.height;
    
    platforms = add.group();
    platforms.enableBody = true;
    
    const ground = platforms.create(0, world.height - 64, "platform");
    ground.scale.setTo(2, 2);
    ground.body.immovable = true;
    
    let ledge = platforms.create(700, 800, "platform");
    ledge.body.immovable = true;
    ledge = platforms.create(1200, 700, "platform");
    ledge.body.immovable = true;
    ledge = platforms.create(1750, 600, "platform");
    ledge.body.immovable = true;
    ledge = platforms.create(2000, 450, "platform");
    ledge.body.immovable = true;
}
// creating the game UI
function createUI() {
    const textFormat = {
        fontSize: '26px',
        fill: "#000"
    };
    const ui = phaser.userinterface = {};
    ui.position = phaser.add.text(16, 16, "-, -", textFormat);
    ui.fps = phaser.add.text(16, 48, "fps: -", textFormat);
    ui.velocity = phaser.add.text(16, 80, "-, -", textFormat);
    ui.position.fixedToCamera = true;
    ui.fps.fixedToCamera = true;
    ui.velocity.fixedToCamera = true;
}

// a structure of the currently held keys
const heldKeys = {
    left: false,
    right: false,
    up: false
};

// function called every frame
function update() {
    // if the websocket is not ready
    if (!ready) return;
    
    // checking collisions for all players
    const arcade = this.physics.arcade;
    players.forEach(function(p) {
        const hitPlatform = arcade.collide(p.sprite, platforms);
        updatePhysics(p, hitPlatform);
    });
    
    const hitPlatform = this.physics.arcade.collide(player.sprite, platforms);
    
    // this handles the player controls
    if (hitPlatform) {
        let moving = false;
        if (phaser.keys.a.isDown || phaser.keys.left.isDown) {
            if (!heldKeys.left) {
                client.sendMove(Type.Action.LEFT);
                moving = true;
                heldKeys.left = true;
                heldKeys.right = false;
            }
        } else if (phaser.keys.d.isDown || phaser.keys.right.isDown) {
            if (!heldKeys.right) {
                client.sendMove(Type.Action.RIGHT);
                moving = true;
                heldKeys.left = false;
                heldKeys.right = true;
            }
        } else {
            heldKeys.left = false;
            heldKeys.right = false;
        }
        if (phaser.keys.up.isDown || phaser.keys.w.isDown) {
            if (!heldKeys.up) {
                client.sendMove(Type.Action.JUMP);
                moving = true;
                heldKeys.up = true;
            }
        } else {
            heldKeys.up = false;
        }
        if (!heldKeys.left && !heldKeys.right && !heldKeys.up) {
            client.sendMove(Type.Action.STOP);
        }
    }
    
    updatePhysics(player, hitPlatform);
    
    updateUI();
}
// this function updates player position based on velocity
function updatePhysics(p, hitPlatform) {
    const timeSince = (Date.now() - p.lastPhysicsUpdate) / 1000;
    
    // (time since last update / 1000) * velocity x
    p.sprite.x += timeSince * p.velocity.x;
    
    // p.velocity.y += ((time since last update / 1000) * gravity)
    if (!hitPlatform || p.velocity.y < 0) {
        p.velocity.y += timeSince * worldGravity;
        p.sprite.y += timeSince * p.velocity.y;
    }
    
    p.lastPhysicsUpdate = Date.now();
}
// updates the UI text
function updateUI() {
    const ui = phaser.userinterface;
    const sprite = player.sprite;
    ui.position.text = Math.round(sprite.x) + ", " + Math.round(sprite.y);
    ui.fps.text = "fps: " + phaser.time.fps;
    ui.velocity.text = player.velocity.x + ", " + player.velocity.y;
}