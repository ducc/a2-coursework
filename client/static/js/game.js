/* global Phaser GameWebSocket Player PLAYER_GRAVITY */

const GAME_WIDTH = window.innerWidth;
const GAME_HEIGHT = window.innerHeight;
const BASE_PATH = "/client/static"
const POSITION_TEXT_FORMAT = "X: {0}, Y: {1}";
const SCORE_TEXT_FORMAT = "Score: {0}";
const ONLINE_TEXT_FORMAT = "Online: {0}";
const FPS_TEXT_FORMAT = "FPS: {0}";
const HEALTH_TEXT_FORMAT = "Health: {0}";

let localId = null;
const entities = new Map();

class Game {
    constructor() {
        this.game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.AUTO, " ", {
            preload: this.preload,
            create: this.create,
            update: this.update,
        });
    }

    preload() {
        this.game.load.image("sky", BASE_PATH + "/img/sky.png");
        this.game.load.image("ground", BASE_PATH + "/img/platform.png");
        this.game.load.image("star", BASE_PATH + "/img/star.png");
        this.game.load.image("bullet", BASE_PATH + "/img/sun.jpg");
        this.game.load.spritesheet("dude", BASE_PATH + "/img/dude.png", 32, 48);
    }
    
    create() {
        this.game.stage.disableVisibilityChange = true;
        this.game.time.advancedTiming = true;
        this.game.world.setBounds(0, 0, 3000, 1000);
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        const sky = this.game.add.sprite(0, 0, "sky");
        sky.height = this.game.world.height;
        sky.width = this.game.world.width;
        const playerSprite = this.game.add.sprite(50, this.world.height - 150, "dude");
        this.player = new Player(this.game, playerSprite);
        this.game.camera.follow(playerSprite);
        
        this.platforms = this.game.add.group();
        this.platforms.enableBody = true;
        const ground = this.platforms.create(0, this.game.world.height - 64, "ground");
        ground.scale.setTo(2, 2);
        ground.body.immovable = true;
        let ledge = this.platforms.create(3000, 400, "ground");
        ledge.body.immovable = true;
        ledge = this.platforms.create(1500, 250, "ground");
        ledge.body.immovable = true;
        ledge = this.platforms.create(1000, 600, "ground");
        ledge.body.immovable = true;
        ledge = this.platforms.create(650, 800, "ground");
        ledge.body.immovable = true;
        ledge = this.platforms.create(1500, 350, "ground");
        ledge.scale.setTo(0.1, 5);
        ledge.body.immovable = true;
        ledge = this.platforms.create(2200, 600, "ground");
        ledge.body.immovable = true;
        ledge = this.platforms.create(2500, 300, "ground");
        ledge.body.immovable = true;
        
        const cursors = this.game.input.keyboard.createCursorKeys();
        this.keys = {
            w: this.game.input.keyboard.addKey(Phaser.Keyboard.W),
            s: this.game.input.keyboard.addKey(Phaser.Keyboard.S),
            a: this.game.input.keyboard.addKey(Phaser.Keyboard.A),
            d: this.game.input.keyboard.addKey(Phaser.Keyboard.D),
            up: cursors.up,
            down: cursors.down,
            left: cursors.left,
            right: cursors.right,
            space: this.game.input.keyboard.addKey(32)
        };
        prepareUI(this.game);
    }
    
    update() {
        const hitPlatform = this.game.physics.arcade.collide(this.player.sprite, this.platforms);
        entities.forEach(entity => {
            this.game.physics.arcade.collide(entity.sprite, this.platforms);
        });
        if (hitPlatform) {
            this.player.velocity.x = 0;
            if (this.game.keys.a.isDown || this.game.keys.left.isDown) {
                this.player.left();
            } else if (this.keys.right.isDown || this.keys.d.isDown) {
                this.player.right();
            } else {
                this.player.stop();
            }
        }
        if (this.keys.w.isDown || this.keys.up.isDown) {
            this.player.jump();
        }
        updateUI(this);
    }
    
    get player() {
        return this.player;
    }
}

let game;

const ws = new GameWebSocket(() => {
    game = new Game();
});

/*const ws = new GameWebSocket(() => {
    game = new Phaser.Game(GAME_WIDTH, GAME_HEIGHT, Phaser.AUTO, " ", {
        preload: function() {
            this.load.image("sky", BASE_PATH + "/img/sky.png");
            this.load.image("ground", BASE_PATH + "/img/platform.png");
            this.load.image("star", BASE_PATH + "/img/star.png");
            this.load.image("bullet", BASE_PATH + "/img/sun.jpg");
            this.load.spritesheet("dude", BASE_PATH + "/img/dude.png", 32, 48);
        },
        create: function() {
            this.stage.disableVisibilityChange = true;
            this.time.advancedTiming = true;
            this.world.setBounds(0, 0, 3000, 1000);
            
            this.physics.startSystem(Phaser.Physics.ARCADE);
            const sky = this.add.sprite(0, 0, "sky");
            sky.height = this.world.height;
            sky.width = this.world.width;
            
            const playerSprite = this.add.sprite(50, this.world.height - 150, "dude");
            this.player = new Player(this, playerSprite);
            this.camera.follow(playerSprite);
            
            createWorld(this);
            
            const cursors = this.input.keyboard.createCursorKeys();
            this.keys = {
                w: this.input.keyboard.addKey(Phaser.Keyboard.W),
                s: this.input.keyboard.addKey(Phaser.Keyboard.S),
                a: this.input.keyboard.addKey(Phaser.Keyboard.A),
                d: this.input.keyboard.addKey(Phaser.Keyboard.D),
                up: cursors.up,
                down: cursors.down,
                left: cursors.left,
                right: cursors.right,
                space: this.input.keyboard.addKey(32)
            };
            
            prepareUI(this);
        },
        update: function() {
            const hitPlatform = this.physics.arcade.collide(this.player.sprite, this.platforms);
            
            entities.forEach(entity => {
                this.physics.arcade.collide(entity.sprite, this.platforms);
            });
            
            if (hitPlatform) {
                this.player.velocity.x = 0;
                if (this.keys.a.isDown || this.keys.left.isDown) {
                    this.player.left();
                } else if (this.keys.right.isDown || this.keys.d.isDown) {
                    this.player.right();
                } else {
                    this.player.stop();
                }
            }
            
            if (this.keys.w.isDown || this.keys.up.isDown) {
                this.player.jump();
            }
            
            updateUI(this);
        }
    });
});*/

function createNewEntity(id, x, y) {
    const entitySprite = game.game.add.sprite(x, y, "dude");
    const entity = new Player(game.game, entitySprite);
    return entity;
}

function prepareUI(game) {
    const textFormat = {
        fontSize: '26px',
        fill: "#000"
    }
    game.score = 0;
    game.health = 100;
    game.positionText = game.add.text(16, 16, POSITION_TEXT_FORMAT.format(game.player.x, game.player.y), textFormat);
    game.scoreText = game.add.text(16, 48, SCORE_TEXT_FORMAT.format(game.score), textFormat);
    game.onlineText = game.add.text(16, 80, ONLINE_TEXT_FORMAT.format(entities.size + 1), textFormat);
    game.fpsText = game.add.text(16, 112, FPS_TEXT_FORMAT.format(game.time.fps), textFormat);
    game.healthText = game.add.text(16, 144, HEALTH_TEXT_FORMAT.format(game.player.health), textFormat);
    game.positionText.fixedToCamera = true;
    game.scoreText.fixedToCamera = true;
    game.onlineText.fixedToCamera = true;
    game.fpsText.fixedToCamera = true;
    game.healthText.fixedToCamera = true;
}

function updateUI(game) {
    game.positionText.text = POSITION_TEXT_FORMAT.format(Math.round(game.player.x), Math.round(game.player.y));
    game.scoreText.text = SCORE_TEXT_FORMAT.format(game.score);
    game.onlineText.text = ONLINE_TEXT_FORMAT.format(entities.size + 1);
    game.fpsText.text = FPS_TEXT_FORMAT.format(game.time.fps);
    game.healthText = HEALTH_TEXT_FORMAT.format(game.player.health);
}
