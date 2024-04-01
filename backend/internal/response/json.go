package response

import (
	"encoding/json"
	"net/http"
)

func JSONSuccess(w http.ResponseWriter, data map[string]interface{}) error {
	if data == nil {
		data = map[string]interface{}{}
	}

	data["status"] = "success"

	return JSON(w, http.StatusOK, data)
}

func JSON(w http.ResponseWriter, status int, data any) error {
	return JSONWithHeaders(w, status, data, nil)
}

func JSONWithHeaders(w http.ResponseWriter, status int, data any, headers http.Header) error {
	js, err := json.MarshalIndent(data, "", "\t")
	if err != nil {
		return err
	}

	js = append(js, '\n')

	for key, value := range headers {
		w.Header()[key] = value
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	w.Write(js)

	return nil
}
