package main

import (
	"github.com/gorilla/websocket"
	"log"
	"time"
)

type (
	// generic structure for player x and y coordinates
	playerXY struct {
		x float64
		y float64
	}

	// this structure represents a connected player
	player struct {
		connection    *websocket.Conn
		id            uint
		location      *playerXY
		velocity      *playerXY
		health        uint
		currentAction uint
		startedMoving int64
	}
)

// creates a new player structure
// c = a websocket connection
// id = unique id for the player
func newPlayer(c *websocket.Conn, id uint) *player {
	p := new(player)
	p.connection = c
	p.id = id
	p.location = &playerXY{default_x, default_y}
	p.velocity = &playerXY{0, 0}
	p.health = default_health
	p.currentAction = action_stop
	p.startedMoving = 0
	return p
}

// sends a byte array to the player
func (p *player) sendBytes(data []byte) {
	p.connection.WriteMessage(message_type, data)
}

// creates a new response and sends it to the player
func (p *player) sendResponse(messageType uint, data ...interface{}) {
	p.sendBytes(createResponse(messageType, data...))
}

// calculates the new position of a player over a period of time
// returns the player's new x and y positions
func (p *player) calculatePosition() (float64, float64) {
	if p.startedMoving == 0 {
		return p.location.x, p.location.y
	}
	currentTime := time.Now().UnixNano()
	timeSince := float64((currentTime-p.startedMoving)/1000000) / 1000
	changeX := timeSince * p.velocity.x
	x := p.location.x + changeX
	y := p.location.y
	if p.velocity.y != 0 {
		gravity := (timeSince / 2 * world_gravity)
		velocity := p.velocity.y + gravity
		y = p.location.y + (timeSince * velocity)
	}
	//b, _ := w.inPlatform(x, y)
	//log.Println("in platform:", b, x, y)
	return x, y
}

// applies the new values from the calculatePosition function
func (p *player) adjustPosition() {
	if p.startedMoving == 0 {
		return
	}
	p.location.x, p.location.y = p.calculatePosition()
	val, _ := w.inPlatform(p.location.x, p.location.y)
	log.Println("in platform,", val, p.location.x, p.location.y)
	p.startedMoving = 0
}
