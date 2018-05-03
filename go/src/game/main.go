package main

import (
	"encoding/json"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
	"os"
	"time"
)

// constant variables that do not change
const (
	static_file_dir                = "/home/ubuntu/workspace/client/"
	message_type                   = 1
	default_x                      = 50
	default_y                      = 888
	default_health         uint    = 100
	default_velocity_jump  float64 = -300
	default_velocity_left  float64 = -150
	default_velocity_right float64 = 150
	world_gravity          float64 = 300
)

// this defines a function as a type so that i can type
// handler instead of func(*player, []interface{}) each time it is used
type handler func(*player, []interface{})

var (
	w *world

	// the server address
	addr = os.Getenv("IP") + ":" + os.Getenv("PORT")

	// a websocket upgrader instance - this upgrades a standard http connection
	// to a websocket connection
	upgrader = websocket.Upgrader{}

	// this variable is incremented for each new player as a unique id
	counter uint = 0

	// a map storing connected players by their id
	players = make(map[uint]*player)

	// a map storing the protocol message handlers
	handlers = make(map[uint]handler)
)

// registers all the websocket message handlers
func registerHandlers() {
	// when the player first connects to the websocket and sends a hello
	// message
	handlers[message_hello] = func(p *player, data []interface{}) {
		// send a welcome message to the player
		p.sendResponse(message_welcome, p.id, p.location.x, p.location.y,
			p.health, world_gravity)

		// send a join message for each connected player to the newly connected
		// player so they know who is currently playing
		for _, player := range players {
			if player.id == p.id {
				continue
			}
			p.sendResponse(message_join, player.id, player.location.x,
				player.location.y, player.health)
		}

		// send a join message to all other players
		body := createResponse(message_join, p.id, p.location.x, p.location.y,
			p.health)
		broadcast(body, p)
	}

	// when a player sends a move request
	handlers[message_move_request] = func(p *player, data []interface{}) {
		action := uintFromInterface(data[0])
		p.adjustPosition()
		switch action {
		case action_stop:
			{
				// when the player is stopped on a platform
				response := createResponse(message_move, p.id, action, 0,
					p.location.x, p.location.y)
				broadcast(response, nil)
				p.velocity.x = 0
				p.velocity.y = 0
				break
			}
		case action_left:
			{
				// when a player moves left
				p.startedMoving = time.Now().UnixNano()
				p.velocity.x = default_velocity_left
				response := createResponse(message_move, p.id, action,
					p.velocity.x, p.location.x, p.location.y)
				broadcast(response, nil)
				break
			}
		case action_right:
			{
				// when a player moves right
				p.startedMoving = time.Now().UnixNano()
				p.velocity.x = default_velocity_right
				response := createResponse(message_move, p.id, action,
					p.velocity.x, p.location.x, p.location.y)
				broadcast(response, nil)
				break
			}
		case action_jump:
			{
				// when a player jumps
				p.startedMoving = time.Now().UnixNano()
				p.velocity.y = default_velocity_jump
				response := createResponse(message_move, p.id, action,
					p.velocity.y, p.location.x, p.location.y)
				broadcast(response, nil)
				break
			}
		}
	}
}

// this is the function called when the program starts
func main() {
	w = newWorld(3000, 1000)
	populateWorld(w)

	log.Println("Starting server on ", addr)
	registerHandlers()

	// the websocket http route
	http.HandleFunc("/gateway", func(w http.ResponseWriter, r *http.Request) {
		// upgrades a connection to a websocket connection
		c, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println("Upgrade,", err)
			return
		}

		// create a new player
		p := newPlayer(c, counter)
		counter++

		// add the player to the players map
		players[p.id] = p

		log.Println("New connection from", r.RemoteAddr, "player id", p.id)

		// this is ran when the function finishes running
		defer func() {
			// close the connection & delete from the players map
			c.Close()
			delete(players, p.id)
		}()

		// send the hi message to the player to initiate the handshake
		p.sendResponse(message_hi)

		// an infinite loop
		for {
			// reading a websocket message
			_, msg, err := c.ReadMessage()
			if err != nil {
				log.Println("Read,", err)
				break
			}

			// convert a json array string into a slice
			arr := make([]interface{}, 0)
			err = json.Unmarshal(msg, &arr)
			if err != nil {
				log.Println("Received invalid json,", err)
				continue
			}

			// get and invoke the handler for the message
			messageType := uintFromInterface(arr[0])
			if handler, ok := handlers[messageType]; ok {
				handler(p, arr[1:])
			}
		}
	})

	// serve the client files
	http.Handle("/", http.FileServer(http.Dir(static_file_dir)))

	// start the server
	log.Fatal(http.ListenAndServe(addr, nil))
}
