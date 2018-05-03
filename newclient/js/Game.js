/* global Phaser Msg Action */

var WORLD_BOUNDS = {
    X: 4000,
    Y: 4000
};

var Game = function(client, callback) {
    this.players = [];
    this.playerId = null;
    this.phaser = new Phaser.Game(window.innerWidth, window.innerHeight, Phaser.AUTO, ' ', {
        client: client,
        callback: callback,
        players: this.players,
        keyState: { up: false, down: false, left: false, right: false },
        preload: this.preload, 
        create: this.create, 
        update: this.update
    });
};

Game.prototype.getPlayer = function(id) {
    for (var i = 0; i < this.players.length; i++) {
        if (this.players[i].id == id) {
            return this.players[i];
        }
    }
    return null;
};

Game.prototype.preload = function() {
    this.load.image('background','img/bg.png');
    this.load.image('player','img/phaser-dude.png');
};

Game.prototype.create = function() {
    this.stage.disableVisibilityChange = true;
    this.add.tileSprite(0, 0, WORLD_BOUNDS.X, WORLD_BOUNDS.Y, 'background');
    this.world.setBounds(0, 0, WORLD_BOUNDS.X, WORLD_BOUNDS.Y);
    this.physics.startSystem(Phaser.Physics.Arcade);
    var keyboard = this.input.keyboard;
    this.cursors = keyboard.createCursorKeys();
    this.cursors.w = keyboard.addKey(Phaser.Keyboard.W);
    this.cursors.a = keyboard.addKey(Phaser.Keyboard.A);
    this.cursors.s = keyboard.addKey(Phaser.Keyboard.S);
    this.cursors.d = keyboard.addKey(Phaser.Keyboard.D);
    this.callback();
};

Game.prototype.update = function() {
    for (var i = 0; i < this.players.length; i++) {
        var player = this.players[i];
        if (!player.self) continue;
        var changed = false;
        if (this.cursors.up.isDown || this.cursors.w.isDown) {
            if (!this.keyState.up) {
                this.keyState.up = true;
                this.keyState.down = false;
                changed = true;
                console.log("up");
            }
        } else if (this.cursors.down.isDown || this.cursors.s.isDown) {
            if (!this.keyState.down) {
                this.keyState.down = true;
                this.keyState.up = false;
                changed = true;
                console.log("down");
            }
        } else {
            if (this.keyState.up || this.keyState.down) {
                this.keyState.up = false;
                this.keyState.down = false;
                changed = true;
                console.log("stop y");
            }
        }
        if (this.cursors.left.isDown || this.cursors.a.isDown) {
            if (!this.keyState.left) {
                this.keyState.left = true;
                this.keyState.right = false;
                changed = true;
                console.log("left");
            }
            player.sprite.angle -= 1;
        } else if (this.cursors.right.isDown || this.cursors.d.isDown) {
            if (!this.keyState.right) {
                this.keyState.right = true;
                this.keyState.left = false;
                changed = true;
                console.log("right");
            }
            player.sprite.angle += 1;
        } else {
            if (this.keyState.left || this.keyState.right) {
                this.keyState.left = false;
                this.keyState.right = false;
                changed = true;
                console.log("stop x");
            }
        }
        if (!changed) continue;
        var bits = 0;
        if (this.keyState.up) bits = bits | Action.UP;
        else if (this.keyState.down) bits = bits | Action.DOWN;
        if (this.keyState.left) bits = bits | Action.LEFT;
        else if (this.keyState.right) bits = bits | Action.RIGHT;
        this.client.send([Msg.MOVE_REQUEST, bits]);
    }
};