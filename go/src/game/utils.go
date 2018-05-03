package main

import (
	"encoding/json"
	"log"
)

// creates a new respose message
// messageType = type of message from types.go
// data = array of data to include in the message
// returns a byte array
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

// utility method to convert an interface{} type to a uint
func uintFromInterface(input interface{}) uint {
	return uint(input.(float64))
}

// sends a byte array to all connected players
// data = the byte array to send
// p = a player to exclude, if left nil it is ignored
func broadcast(data []byte, p *player) {
	for _, player := range players {
		if p != nil && p == player {
			continue
		}
		player.sendBytes(data)
	}
}
