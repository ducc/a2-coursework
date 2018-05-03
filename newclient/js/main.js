/* global Client Msg Game Player */

var client = new Client();
var game = new Game(client, function() {
    client.open("schoolproject-jb5959.c9users.io", "80");
});
client.handlers[Msg.HI] = function(json) {
    client.send([Msg.HELLO]);
};
client.handlers[Msg.WELCOME] = function(json) {
    var id = json[1];
    var x = json[2];
    var y = json[3];
    var player = new Player(game.phaser, id, x, y);
    player.self = true;
    game.players.push(player);
    game.phaser.camera.follow(player.sprite);
};
client.handlers[Msg.MOVE] = function(json) {
    var player = game.getPlayer(json[1]);
    player.sprite.x = json[2];
    player.sprite.y = json[3];
    player.sprite.body.velocity.x = json[4];
    player.sprite.body.velocity.y = json[5];
};
client.handlers[Msg.JOIN] = function(json) {
    console.log("join " + json);
    var player = new Player(game.phaser, json[1], json[2], json[3]);
    game.players.push(player);
};
client.handlers[Msg.LEAVE] = function(json) {
    console.log("leave " + json);
};