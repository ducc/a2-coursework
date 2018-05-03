/* global phaser */

const PLAYER_TEXTURE = "dude";

// the player class
// id = the player's id
// x, y = the player's location
// health = the player's health
const Player = function(id, x, y, health) {
    this.id = id;
    this.health = health;
    
    // create a new object for velocity values
    this.velocity = {
        x: 0,
        y: 0
    };
    
    // store the current time
    this.lastPhysicsUpdate = Date.now();
    
    // create a new phaser sprite in the game & enable arcade physics
    this.sprite = phaser.add.sprite(x, y, PLAYER_TEXTURE);
    phaser.physics.arcade.enable(this.sprite);
    
    const body = this.sprite.body;
    // enable collisions with the world borders
    body.collideWorldBounds = true;
    
    // prepare the player's animations
    const animations = this.sprite.animations;
    animations.add("left", [0, 1, 2, 3], 10, true);
    animations.add("right", [5, 6, 7, 8], 10, true);
};

// plays the specified animation
Player.prototype.playAnimation = function(animation) {
    this.sprite.animations.play(animation);
};

// stops the playing animation & sets the player's frame to standing still
Player.prototype.stopAnimations = function() {
    this.sprite.animations.stop();
    this.sprite.frame = 4;
};