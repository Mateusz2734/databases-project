package misc

import "github.com/Mateusz2734/databases-project/backend/internal/db"

func GetCountryCities(entries []db.GetAvailableCitiesWithCountriesRow) map[string][]string {
	countryCities := make(map[string][]string, len(entries))

	for _, entry := range entries {
		if _, ok := countryCities[entry.Country]; !ok {
			countryCities[entry.Country] = []string{}
		}

		countryCities[entry.Country] = append(countryCities[entry.Country], entry.City)
	}

	return countryCities
}
