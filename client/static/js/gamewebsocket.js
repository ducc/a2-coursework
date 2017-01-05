/* global localId createNewEntity game entities */

const WEBSOCKET_ADDRESS = "ws://schoolproject-jb5959.c9users.io:80/gateway";

let welcomed = false;

class GameWebSocket {
    constructor(ready) {
        this.open = false;
        this.websocket = new WebSocket(WEBSOCKET_ADDRESS);
        this.websocket.onopen = (event) => {
            this.open = true;
            console.log("OPEN!");
            ready();
        };
        this.websocket.onclose = (event) => {
            this.open = false;
            this.websocket = null;
            console.log("CLOSE!");
        };
        this.websocket.onmessage = (event) => {
            var json = JSON.parse(event.data);
            switch (json.type) {
                case "welcome": {
                    welcomed = true;
                    localId = json.content.id;
                    for (let i = 0; i < json.content.players.length; i++) {
                        const entity = json.content.players[i];
                        if (entity.id == localId) continue;
                        entities.set(entity.id, createNewEntity(entity.id, entity.location.x, entity.location.y));
                    }
                    break;
                }
                case "join": {
                    if (!welcomed) break;
                    const id = json.content.id;
                    entities.set(id, createNewEntity(id, 50, game.world.height - 150));
                    break;
                }
                case "leave": {
                    if (!welcomed) break;
                    const id = json.content.id;
                    const entity = entities.get(id);
                    entity.sprite.destroy();
                    entities.delete(id);
                    break;
                }
                case "update": {
                    if (!welcomed) break;
                    const id = json.content.id;
                    let entity = entities.get(id);
                    if (entity == undefined) {
                        entity = createNewEntity(id);
                        entities.set(id, entity);
                    }
                    entity.velocity.x = json.content.velocity.x;
                    entity.velocity.y = json.content.velocity.y;
                    entity.x = json.content.location.x;
                    entity.y = json.content.location.y;
                    try {
                        const animation = json.content.animation;
                        if (animation.length != 0 && animation != undefined && this.open && animation != "null") {
                            entity.sprite.animations.play(animation);
                        } else {
                            entity.sprite.animations.stop();
                            entity.sprite.frame = 4;
                        }
                    } catch (e) {}
                    break;
                }
            }
        };
        this.websocket.onerror = (event) => {
            console.log("ERROR: " + event.data);
        };
    }
    
    send(type, content) {
        const obj = {
            type: type,
            content: content
        };
        this.websocket.send(JSON.stringify(obj));
    }
}