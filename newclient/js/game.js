/* global Phaser player ready Type client players PLAYER_JUMP_VELOCITY */

let platforms;
let canMove = true;

const phaser = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, " ", {
    preload: preload,
    create: create,
    update: update,
});

function preload() {
    phaser.load.image("sky", "img/sky.png");
    phaser.load.image("platform", "img/platform.png");
    phaser.load.spritesheet("dude", "img/dude.png", 32, 48);
    phaser.ready();
}

function create() {
    createKeys();
    
    phaser.stage.disableVisibilityChange = true;
    phaser.time.advancedTiming = true;
    
    const physics = phaser.physics;
    physics.startSystem(Phaser.Physics.ARCADE);
    
    createWorld();
    createUI();
}
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
    
    let ledge = platforms.create(3000, 400, "platform");
    ledge.body.immovable = true;
    ledge = platforms.create(1500, 250, "platform");
    ledge.body.immovable = true;
    ledge = platforms.create(1000, 600, "platform");
    ledge.body.immovable = true;
    ledge = platforms.create(650, 800, "platform");
    ledge.body.immovable = true;
    ledge = platforms.create(1500, 350, "platform");
    ledge.scale.setTo(0.1, 5);
    ledge.body.immovable = true;
    ledge = platforms.create(2200, 600, "platform");
    ledge.body.immovable = true;
    ledge = platforms.create(2500, 300, "platform");
    ledge.body.immovable = true;
}
function createUI() {
    const textFormat = {
        fontSize: '26px',
        fill: "#000"
    };
    const ui = phaser.userinterface = {};
    ui.position = phaser.add.text(16, 16, "-, -", textFormat);
    ui.fps = phaser.add.text(16, 48, "fps: -", textFormat);
    ui.velocity = phaser.add.text(16, 80, "-, -", textFormat);
    ui.acceleration = phaser.add.text(16, 112, "-, -", textFormat);
    ui.drag = phaser.add.text(16, 144, "-, -", textFormat);
    ui.position.fixedToCamera = true;
    ui.fps.fixedToCamera = true;
    ui.velocity.fixedToCamera = true;
    ui.acceleration.fixedToCamera = true;
    ui.drag.fixedToCamera = true;
}

let jumpTime = 0;

function update() {
    if (!ready) return;
    
    const arcade = this.physics.arcade;
    players.forEach(function(p) {
        arcade.collide(p.sprite, platforms);
    });
    
    const hitPlatform = this.physics.arcade.collide(player.sprite, platforms);
    if (hitPlatform) {
        
        if (jumpTime != 0) {
            const current = Date.now();
            console.log(current - jumpTime);
            jumpTime = 0;
        }
        
        if (phaser.keys.a.isDown || phaser.keys.left.isDown) {
            client.sendMove(Type.Action.LEFT);
        } else if (phaser.keys.d.isDown || phaser.keys.right.isDown) {
            client.sendMove(Type.Action.RIGHT);
        } else {
            client.sendMove(Type.Action.STOP);
        }
        if (phaser.keys.up.isDown) {
            player.sprite.body.velocity.y = PLAYER_JUMP_VELOCITY;
            jumpTime = Date.now();
        }
    }
    updateUI();
}
function updateUI() {
    const ui = phaser.userinterface;
    const sprite = player.sprite;
    ui.position.text = Math.round(sprite.x) + ", " + Math.round(sprite.y);
    ui.fps.text = "fps: " + phaser.time.fps;
    ui.velocity.text = player.sprite.body.velocity.x + ", " + player.sprite.body.velocity.y;
    ui.acceleration.text = player.sprite.body.acceleration.x + ", " + player.sprite.body.acceleration.y;
    ui.drag.text = player.sprite.body.drag.x + ", " + player.sprite.body.drag.y;
}