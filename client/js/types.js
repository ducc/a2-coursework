const Type = {
    // websocket message ids
    Message: {
        HI: 0,
        HELLO: 1,
        WELCOME: 2,
        MOVE_REQUEST: 3,
        MOVE: 4,
        JOIN: 5,
    },
    
    // move actions
    Action: {
        STOP: 0,
        LEFT: 1,
        RIGHT: 2,
        JUMP: 3,
        MULTIPLE: 4
    },
    
    // animation constants
    Animation: {
        LEFT: "left",
        RIGHT: "right"
    }
}