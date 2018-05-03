package main

import (
	"encoding/json"
	"log"
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
