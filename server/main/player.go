package main

import "github.com/gorilla/websocket"

type (
	// a structure to store player x and y coordinates
	playerLocation struct {
		X float32 `json:"x"`
		Y float32 `json:"y"`
	}

	// a structure to store x and y velocity values
	playerVelocity struct {
		X float32 `json:"x"`
		Y float32 `json:"y"`
	}

	// this is the player class
	player struct {
		Id         uint            `json:"id"`
		Location   *playerLocation `json:"location"`
		Velocity   *playerVelocity `json:"velocity"`
		Animation  *string         `json:"animation"`
		connection *websocket.Conn
		welcomed   bool
	}
)

const (
	// this is a constant used when sending websocket messages
	message_type = 1
)

// creates a new player instance
func newPlayer(connection *websocket.Conn) *player {
	p := new(player)
	counter++
	p.Id = counter
	p.connection = connection
	p.Location = &playerLocation{
		0, 0,
	}
	p.Velocity = &playerVelocity{
		0, 0,
	}
	p.Animation = nil
	p.welcomed = false
	return p
}

// sends bytes to the player's connected websocket
func (p player) sendBytes(msg []byte) error {
	return p.connection.WriteMessage(message_type, msg)
}

// converts a string to bytes and then sends to the player's websocket
func (p player) send(msg string) error {
	return p.sendBytes([]byte(msg))
}
