package main

import (
	"github.com/gorilla/websocket"
	"time"
)

type (
	playerXY struct {
		x float64
		y float64
	}
	player struct {
		connection    *websocket.Conn
		id            uint
		location      *playerXY
		velocity      *playerXY
		currentAction uint
		startedMoving int64
	}
)

func newPlayer(c *websocket.Conn, id uint) *player {
	p := new(player)
	p.connection = c
	p.id = id
	p.location = &playerXY{default_x, default_y}
	p.velocity = &playerXY{0, 0}
	p.currentAction = 0
	p.startedMoving = 0
	return p
}

func (p *player) sendBytes(data []byte) {
	p.connection.WriteMessage(message_type, data)
}

func (p *player) sendResponse(messageType uint, data ...interface{}) {
	p.sendBytes(createResponse(messageType, data...))
}

func (p *player) calculatePosition() (float64, float64) {
	if p.startedMoving == 0 {
		return p.location.x, p.location.y
	}
	if p.location.x <= (27*2) || p.location.x >= world_x-(27*2) ||
		p.location.y <= (40*2) || p.location.y >= world_y-(40*2) {
		return default_x, default_y
	}
	currentTime := time.Now().UnixNano()
	timeSince := float64((currentTime-p.startedMoving)/1000000) / 1000
	changeX := timeSince * p.velocity.x
	changeY := timeSince * p.velocity.y
	x := p.location.x + changeX
	y := p.location.y + changeY
	return x, y
}

func (p *player) adjustPosition() {
	if p.startedMoving == 0 {
		return
	}
	p.location.x, p.location.y = p.calculatePosition()
	p.startedMoving = 0
}
