package main

const (
	message_hi           uint = 0
	message_hello        uint = 1
	message_welcome      uint = 2
	message_move_request uint = 3
	message_move         uint = 4
	message_join         uint = 5
	message_leave        uint = 6

	action_up    uint = 1 << 0
	action_down  uint = 1 << 1
	action_left  uint = 1 << 2
	action_right uint = 1 << 3
)

func hasBits(actions uint, action uint) bool {
	return (actions & action) == action
}
