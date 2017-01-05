const PLAYER_GRAVITY = 500;
const PLAYER_JUMP_VELOCITY = -500;

class Player {
    constructor(game, sprite) {
        this.game = game;
        this.sprite = sprite;
        this.game.physics.arcade.enable(this.sprite);
        //this.sprite.body.bounce.y = 0.2;
        this.sprite.body.gravity.y = PLAYER_GRAVITY;
        this.sprite.body.collideWorldBounds = true;
        this.sprite.animations.add("left", [0, 1, 2, 3], 10, true);
        this.sprite.animations.add("right", [5, 6, 7, 8], 10, true);
        
        this.animation = null;
        this.health = 100;
    }
    
    get update() {
        return {
          location: {
              x: this.x,
              y: this.y
          },
          velocity: {
              x: this.velocity.x,
              y: this.velocity.y
          },
          animation: this.animation
        };
    }
    
    get x() {
        return this.sprite.x;
    }
    
    set x(x) {
        this.sprite.x = x;
    }
    
    get y() {
        return this.sprite.y;
    }
    
    set y(y) {
        this.sprite.y = y;
    }
    
    get velocity() {
        return this.sprite.body.velocity;
    }
    
    left() {
        this.velocity.x = -150;
        this.sprite.animations.play("left");
        this.animation = "left";
    }
    
    right() {
        this.velocity.x = 150;
        this.sprite.animations.play("right");
        this.animation = "right";
    }
    
    stop() {
        this.sprite.animations.stop();
        this.sprite.frame = 4;
        this.animation = null;
    }
    
    jump() {
        this.velocity.y = PLAYER_JUMP_VELOCITY;
    }
}