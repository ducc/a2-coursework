package main

const (
	// websocket message ids
	message_hi           uint = 0
	message_hello        uint = 1
	message_welcome      uint = 2
	message_move_request uint = 3
	message_move         uint = 4
	message_join         uint = 5

	// movement actions
	action_stop     uint = 0
	action_left     uint = 1
	action_right    uint = 2
	action_jump     uint = 3
	action_multiple uint = 4
)
