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
	message_type                   = 1
	default_x                      = 50
	default_y                      = 888
	default_health         uint    = 100
	default_velocity_left  float64 = -150
	default_velocity_right float64 = 150
)

type (
	playerLocation struct {
		x float64
		y float64
	}
	playerVelocity struct {
		x float64
		y float64
	}
	player struct {
		connection    *websocket.Conn
		id            uint
		location      *playerLocation
		velocity      *playerVelocity
		health        uint
		currentAction uint
		startedMoving int64
	}
	handler func(*player, []interface{})
)

var (
	addr          = os.Getenv("IP") + ":" + os.Getenv("PORT")
	upgrader      = websocket.Upgrader{}
	counter  uint = 0
	players       = make(map[uint]*player)
	handlers      = make(map[uint]handler)
)

func createResponse(messageType uint, data ...interface{}) []byte {
	arr := make([]interface{}, 1)
	arr[0] = messageType
	for _, item := range data {
		arr = append(arr, item)
	}
	b, err := json.Marshal(arr)
	if err != nil {
		log.Println("error marshalling,", err)
	}
	return b
}

func newPlayer(c *websocket.Conn, id uint) *player {
	p := new(player)
	p.connection = c
	p.id = id
	p.location = &playerLocation{default_x, default_y}
	p.velocity = &playerVelocity{0, 0}
	p.health = default_health
	p.currentAction = action_stop
	p.startedMoving = 0
	return p
}

func (p *player) sendBytes(data []byte) {
	p.connection.WriteMessage(message_type, data)
}

func (p *player) sendResponse(messageType uint, data ...interface{}) {
	p.sendBytes(createResponse(messageType, data...))
}

func uintFromInterface(input interface{}) uint {
	return uint(input.(float64))
}

func broadcast(data []byte, p *player) {
	for _, player := range players {
		if p != nil && p == player {
			continue
		}
		player.sendBytes(data)
	}
}

func adjustPosition(p *player) {
	if p.startedMoving == 0 {
		return
	}
	currentTime := time.Now().UnixNano()
	timeSince := float64((currentTime - p.startedMoving) / 1000000)
	timeSinceS := timeSince / 1000
	change := timeSinceS * p.velocity.x
	p.location.x = p.location.x + change
	p.startedMoving = 0
}

func registerHandlers() {
	handlers[message_hello] = func(p *player, data []interface{}) {
		p.sendResponse(message_welcome, p.id, p.location.x, p.location.y,
			p.health)
		for _, player := range players {
			if player.id == p.id {
				continue
			}
			p.sendResponse(message_join, player.id, player.location.x,
				player.location.y, player.health)
		}
		body := createResponse(message_join, p.id, p.location.x, p.location.y,
			p.health)
		broadcast(body, p)
	}
	handlers[message_move_request] = func(p *player, data []interface{}) {
		action := uintFromInterface(data[0])
		lastAction := p.currentAction
		p.currentAction = action
		switch action {
		case action_stop:
			{
				adjustPosition(p)
				response := createResponse(message_move, p.id, action, 0, p.location.x,
					p.location.y)
				broadcast(response, nil)
				p.velocity.x = 0
				break
			}
		case action_left:
			{
				if lastAction == action_right {
					adjustPosition(p)
				}
				p.startedMoving = time.Now().UnixNano()
				p.velocity.x = default_velocity_left
				response := createResponse(message_move, p.id, action, p.velocity.x,
					p.location.x, p.location.y)
				broadcast(response, nil)
				break
			}
		case action_right:
			{
				if lastAction == action_left {
					adjustPosition(p)
				}
				p.startedMoving = time.Now().UnixNano()
				p.velocity.x = default_velocity_right
				response := createResponse(message_move, p.id, action, p.velocity.x,
					p.location.x, p.location.y)
				broadcast(response, nil)
				break
			}
		case action_jump:
			{
				break
			}
		}
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
			json.Unmarshal(msg, &arr)
			messageType := uintFromInterface(arr[0])
			if handler, ok := handlers[messageType]; ok {
				handler(p, arr[1:])
			}
		}
	})
	http.Handle("/", http.FileServer(http.Dir("/home/ubuntu/workspace/newclient/")))
	log.Fatal(http.ListenAndServe(addr, nil))
}
