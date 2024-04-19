package main

import (
	"encoding/json"
	"os"
)

type PlaneMetadata struct {
	Rows      int
	Columns   int
	SeatTypes map[string]struct {
		SeatRows []int
	}
	DisabledSeats []struct {
		Row int
		Col int
	}
}

var test = `{"rows":44,"columns":9,"seatTypes":{"default":{"label":"Economy","cssClass":"economy","price":150},"first":{"label":"Business","cssClass":"business","price":1200,"seatRows":[0,1,2,3,4,5,6,7,8,9,10]},"economy_plus":{"label":"Economy Plus","cssClass":"economy-plus","price":300,"seatRows":[11,12,13,14,15,16,17,18]}},"disabledSeats":[{"row":0,"col":0},{"row":0,"col":2},{"row":0,"col":4},{"row":0,"col":6},{"row":0,"col":8},{"row":1,"col":0},{"row":1,"col":2},{"row":1,"col":4},{"row":1,"col":6},{"row":1,"col":8},{"row":2,"col":0},{"row":2,"col":2},{"row":2,"col":4},{"row":2,"col":6},{"row":2,"col":8},{"row":3,"col":0},{"row":3,"col":2},{"row":3,"col":4},{"row":3,"col":6},{"row":3,"col":8},{"row":4,"col":0},{"row":4,"col":2},{"row":4,"col":4},{"row":4,"col":6},{"row":4,"col":8},{"row":5,"col":0},{"row":5,"col":2},{"row":5,"col":4},{"row":5,"col":6},{"row":5,"col":8},{"row":6,"col":0},{"row":6,"col":2},{"row":6,"col":4},{"row":6,"col":6},{"row":6,"col":8},{"row":7,"col":0},{"row":7,"col":2},{"row":7,"col":4},{"row":7,"col":6},{"row":7,"col":8},{"row":8,"col":0},{"row":8,"col":2},{"row":8,"col":4},{"row":8,"col":6},{"row":8,"col":8},{"row":9,"col":0},{"row":9,"col":2},{"row":9,"col":4},{"row":9,"col":6},{"row":9,"col":8},{"row":10,"col":0},{"row":10,"col":2},{"row":10,"col":4},{"row":10,"col":6},{"row":10,"col":8},{"row":11,"col":2},{"row":11,"col":6},{"row":12,"col":2},{"row":12,"col":6},{"row":13,"col":2},{"row":13,"col":6},{"row":24,"col":3},{"row":24,"col":4},{"row":24,"col":5},{"row":25,"col":3},{"row":25,"col":4},{"row":25,"col":5},{"row":26,"col":3},{"row":26,"col":4},{"row":26,"col":5},{"row":42,"col":0},{"row":42,"col":8},{"row":43,"col":0},{"row":43,"col":1},{"row":43,"col":2},{"row":43,"col":6},{"row":43,"col":7},{"row":43,"col":8}],"rowSpacers":[11,14,19,25],"columnSpacers":[3,6]}`

func main() {
	var metadata PlaneMetadata

	err := json.Unmarshal([]byte(test), &metadata)
	if err != nil {
		os.Exit(1)
	}
}
