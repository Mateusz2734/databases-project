package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"os"
	"slices"
	"strings"

	"github.com/Mateusz2734/databases-project/backend/assets"
	"golang.org/x/exp/maps"
	"gopkg.in/yaml.v3"
)

func getFileBeginning(table string) string {
	var insert string
	if table == "airplanes" {
		insert = "airplanes(airplane_model, diagram_metadata)"
	} else if table == "seats" {
		insert = "seats(airplane_id, seat_type, row, \"column\")"
	}
	return "DO $$\nBEGIN\n\tIF (SELECT COUNT(*) FROM " + table + ") = 0 THEN\n\t\tINSERT INTO " + insert + " VALUES\n"
}

func generatePlanesSQL(keys []string, planes map[string]string) string {
	builder := strings.Builder{}
	for i, name := range keys {
		metadata := planes[name]
		builder.WriteString("\t\t('" + name + "', '" + metadata + "')")
		if i == (len(keys) - 1) {
			builder.WriteString(";")
		} else {
			builder.WriteString(",\n")
		}
	}

	return builder.String()
}

func generateSeatsSQL(keys []string, planes map[string]string) (string, error) {
	builder := strings.Builder{}

	for i, name := range keys {
		var metadata PlaneMetadata

		err := json.Unmarshal([]byte(planes[name]), &metadata)
		if err != nil {
			return "", err
		}

		builder.WriteString(metadata.generatePlaneSeatsSQL(i+1, i == len(keys)-1))
	}

	return builder.String(), nil
}

func main() {
	var planes map[string]string
	planesBuffer := bytes.NewBufferString(getFileBeginning("airplanes"))
	seatsBuffer := bytes.NewBufferString(getFileBeginning("seats"))

	data, err := assets.EmbeddedFiles.ReadFile("misc/planes.yaml")

	if err != nil {
		fmt.Println("Cannot open planes.yaml file")
		os.Exit(1)
	}

	err = yaml.Unmarshal(data, &planes)

	if err != nil {
		fmt.Println("Cannot unmarshal planes.yaml")
		os.Exit(1)
	}

	keys := maps.Keys(planes)
	slices.Sort(keys)

	seatsSQL, err := generateSeatsSQL(keys, planes)
	if err != nil {
		fmt.Println("Cannot generate seats SQL: ", err)
	}

	planesBuffer.WriteString(generatePlanesSQL(keys, planes))
	seatsBuffer.WriteString(seatsSQL)
	planesBuffer.WriteString("\n\tEND IF;\nEND;\n$$\nLANGUAGE plpgsql;")
	seatsBuffer.WriteString("\n\tEND IF;\nEND;\n$$\nLANGUAGE plpgsql;")

	os.WriteFile("assets/migrations/004_add_airplanes.up.sql", planesBuffer.Bytes(), 0666)
	os.WriteFile("assets/migrations/005_add_seats.up.sql", seatsBuffer.Bytes(), 0666)
}
