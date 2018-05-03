var Player = function(phaser, id, x, y) {
    console.log("player: " + id);
    console.log(phaser);
    this.id = id;
    this.sprite = phaser.add.sprite(x, y, 'player');
    phaser.physics.arcade.enable(this.sprite);
    this.self = false;
};