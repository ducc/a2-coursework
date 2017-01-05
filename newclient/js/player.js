/* global phaser */

const PLAYER_TEXTURE = "dude";
const PLAYER_GRAVITY = 500;
const PLAYER_JUMP_VELOCITY = -500;

const Player = function(id, x, y, health) {
    this.id = id;
    
    this.sprite = phaser.add.sprite(x, y, PLAYER_TEXTURE);
    phaser.physics.arcade.enable(this.sprite);
    
    const body = this.sprite.body;
    body.gravity.y = 500;
    body.collideWorldBounds = true;
    
    const animations = this.sprite.animations;
    animations.add("left", [0, 1, 2, 3], 10, true);
    animations.add("right", [5, 6, 7, 8], 10, true);
    
    this.health = health;
};

Player.prototype.playAnimation = function(animation) {
    this.sprite.animations.play(animation);
};

Player.prototype.stopAnimations = function() {
    this.sprite.animations.stop();
    this.sprite.frame = 4;
};