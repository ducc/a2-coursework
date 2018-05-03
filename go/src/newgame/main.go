package main

import (
	"encoding/json"
	"github.com/gorilla/websocket"
	"log"
	"net/http"
	"os"
	"time"
)

const (
	static_file_dir                = "/home/ubuntu/workspace/newclient/"
	message_type                   = 1
	character_x                    = 27
	character_y                    = 40
	world_x                        = 4000
	world_y                        = 4000
	default_x                      = (world_x / 2) - (character_x / 2)
	default_y                      = (world_y / 2) - (character_y / 2)
	default_velocity_up    float64 = -300
	default_velocity_down  float64 = 300
	default_velocity_left  float64 = -300
	default_velocity_right float64 = 300
)

type handler func(*player, []interface{})

var (
	addr          = os.Getenv("IP") + ":" + os.Getenv("PORT")
	upgrader      = websocket.Upgrader{}
	counter  uint = 0
	players       = make(map[uint]*player)
	handlers      = make(map[uint]handler)
)

func registerHandlers() {
	handlers[message_hello] = func(p *player, data []interface{}) {
		p.sendResponse(message_welcome, p.id, p.location.x, p.location.y)
		for _, player := range players {
			if player.id == p.id {
				continue
			}
			p.sendResponse(message_join, player.id, player.location.x,
				player.location.y)
		}
		body := createResponse(message_join, p.id, p.location.x, p.location.y)
		broadcast(body, p)
	}
	handlers[message_move_request] = func(p *player, data []interface{}) {
		p.adjustPosition()
		action := uintFromInterface(data[0])
		if action == 0 {
			p.velocity.y = 0
			p.velocity.x = 0
		} else {
			p.startedMoving = time.Now().UnixNano()
		}
		if hasBits(action, action_up) {
			p.velocity.y = default_velocity_up
		}
		if hasBits(action, action_down) {
			p.velocity.y = default_velocity_down
		}
		if hasBits(action, action_left) {
			p.velocity.x = default_velocity_left
		}
		if hasBits(action, action_right) {
			p.velocity.x = default_velocity_right
		}
		body := createResponse(message_move, p.id, p.location.x, p.location.y, p.velocity.x, p.velocity.y)
		broadcast(body, nil)
	}
}

func main() {
	log.Println("Starting server on ", addr)
	registerHandlers()
	http.HandleFunc("/gateway", func(w http.ResponseWriter, r *http.Request) {
		c, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println("Upgrade,", err)
			return
		}
		p := newPlayer(c, counter)
		counter++
		players[p.id] = p
		log.Println("New connection from", r.RemoteAddr, "player id", p.id)
		defer func() {
			c.Close()
			delete(players, p.id)
		}()
		p.sendResponse(message_hi)
		for {
			_, msg, err := c.ReadMessage()
			if err != nil {
				log.Println("Read,", err)
				break
			}
			arr := make([]interface{}, 0)
			err = json.Unmarshal(msg, &arr)
			if err != nil {
				log.Println("Received invalid json,", err)
				continue
			}
			messageType := uintFromInterface(arr[0])
			if handler, ok := handlers[messageType]; ok {
				handler(p, arr[1:])
			}
		}
	})
	http.Handle("/", http.FileServer(http.Dir(static_file_dir)))
	log.Fatal(http.ListenAndServe(addr, nil))
}
