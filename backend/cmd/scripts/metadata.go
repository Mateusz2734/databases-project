package main

import (
	"fmt"
	"strings"
)

type SeatPosition struct {
	Row int
	Col int
}

type PlaneMetadata struct {
	Rows      int
	Columns   int
	SeatTypes map[string]struct {
		SeatRows []int
	}
	DisabledSeats []SeatPosition
}

func (meta PlaneMetadata) constructClassMap() map[int]string {
	classMap := make(map[int]string, meta.Rows)

	for key, val := range meta.SeatTypes {
		for _, innerVal := range val.SeatRows {
			classMap[innerVal] = key
		}
	}

	for i := range meta.Rows {
		_, exists := classMap[i]
		if !exists {
			classMap[i] = "economy"
		}
	}

	return classMap
}

func (meta PlaneMetadata) constructDisabledMap() map[SeatPosition]int {
	disabled := make(map[SeatPosition]int, len(meta.DisabledSeats))

	for _, seat := range meta.DisabledSeats {
		disabled[seat] = 1
	}

	return disabled
}

func (meta PlaneMetadata) generatePlaneSeatsSQL(planeID int, last bool) string {
	builder := strings.Builder{}
	disabled := meta.constructDisabledMap()
	classMap := meta.constructClassMap()

	for row := range meta.Rows {
		for col := range meta.Columns {
			_, exists := disabled[SeatPosition{row, col}]
			if !exists {
				builder.WriteString("\t\t\t(" + fmt.Sprint(planeID) + ", '" + classMap[row] + "', " + fmt.Sprint(row) + ", " + fmt.Sprint(col) + ")")
				if row == meta.Rows-1 && col == meta.Columns-1 && last {
					builder.WriteString(";")
				} else {
					builder.WriteString(",\n")
				}
			}
		}
	}

	return builder.String()
}
