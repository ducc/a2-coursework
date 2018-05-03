var Msg = {
    HI: 0,
    HELLO: 1,
    WELCOME: 2,
    MOVE_REQUEST: 3,
    MOVE: 4,
    JOIN: 5,
    LEAVE: 6
};

var Action = {
    UP: 1 << 0,
    DOWN: 1 << 1,
    LEFT: 1 << 2,
    RIGHT: 1 << 3
};

function hasBits(actions, action) {
    return (actions & action) == action;
}