package main

import (
	"encoding/json"
	"github.com/gorilla/websocket"
	"log"
	"net"
	"net/http"
	"os"
	"time"
)

type (
	// this a base structure for all websocket messages sent from the server
	response struct {
		Type    string      `json:"type"`
		Content interface{} `json:"content"`
	}
)

var (
	// this variables gets the ip and port assigned by c9.io
	addr = os.Getenv("IP") + ":" + os.Getenv("PORT")

	// a new websocket server instance
	upgrader = websocket.Upgrader{
		CheckOrigin: func(r *http.Request) bool {
			return true
		},
	}

	counter uint = 0

	// all the connected players are stored in here by their unique id
	players = make(map[uint]*player)
)

// gets a player by their connection address
func getPlayerByAddr(addr net.Addr) *player {
	for _, p := range players {
		if p.connection.RemoteAddr() == addr {
			return p
		}
	}
	return nil
}

// sends a ws message to all players except for the player in the parameters
func broadcastBytes(source *player, msg []byte) {
	for _, p := range players {
		if p == source {
			continue
		}
		err := p.sendBytes(msg)
		if err != nil {
			log.Printf("err broadcasting to player %d, err: %s\n", p.Id, err)
		}
	}
}

// converts a string to bytes and then invokes the broadcastBytes function
func broadcast(source *player, msg string) {
	broadcastBytes(source, []byte(msg))
}

// converts a response structure into a json string as a byte array
func marshal(resp *response) []byte {
	b, err := json.Marshal(resp)
	if err != nil {
		log.Println("error marshalling,", err)
	}
	return b
}

// this function is invoked to start then program
func main() {
	log.Println("Starting server on ", addr)

	// creating the /gateway route to accept websocket connections
	http.HandleFunc("/gateway", func(w http.ResponseWriter, r *http.Request) {
		c, err := upgrader.Upgrade(w, r, nil)
		if err != nil {
			log.Println("Upgrade,", err)
			return
		}

		// creating a player instance for the new connection
		p := newPlayer(c)
		log.Println("New connection from", r.RemoteAddr, "player id", p.Id)
		log.Println("Connected players: ", len(players))

		// storing the player in a map
		players[p.Id] = p

		// this will close the connection, remove from the map and tell other
		// players the player left at the end of the function
		defer func() {
			c.Close()
			delete(players, p.Id)
			broadcastBytes(p, marshal(&response{"leave", struct {
				Id uint `json:"id"`
			}{p.Id}}))
		}()

		playersSlice := make([]*player, 0)
		for _, pl := range players {
			playersSlice = append(playersSlice, pl)
		}
		time.Sleep(time.Second * 2)
		p.sendBytes(marshal(&response{"welcome", struct {
			Id      uint      `json:"id"`
			Players []*player `json:"players"`
		}{p.Id, playersSlice}}))
		p.welcomed = true
		broadcastBytes(p, marshal(&response{"join", struct {
			Id uint `json:"id"`
		}{p.Id}}))
		for {
			_, msg, err := c.ReadMessage()
			if err != nil {
				log.Println("Read,", err)
				break
			}
			responseTemplate := struct {
				Type    string      `json:"type"`
				Content interface{} `json:"content"`
			}{}
			err = json.Unmarshal(msg, &responseTemplate)
			if err != nil {
				log.Println("Error decoding response,", err)
				continue
			}
			switch responseTemplate.Type {
			case "update":
				{
					if !p.welcomed {
						break
					}
					playerUpdate := struct {
						Location  playerLocation `json:"location"`
						Velocity  playerVelocity `json:"velocity"`
						Animation string         `json:"animation"`
					}{}
					json.Unmarshal([]byte(responseTemplate.Content.(string)), &playerUpdate)
					p.Location = &playerUpdate.Location
					p.Velocity = &playerUpdate.Velocity
					p.Animation = &playerUpdate.Animation
					broadcastBytes(p, marshal(&response{"update", p}))
					break
				}
			}
		}
	})
	http.Handle("/", http.FileServer(http.Dir("/home/ubuntu/workspace/")))
	log.Fatal(http.ListenAndServe(addr, nil))
}
