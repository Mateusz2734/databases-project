## How to run the backend
```bash
make migrations/up
make run/live
```


## API structure

- **GET** `/cities`
  - Retrieves available cities within countries.
  - **Query Parameters:** none
  - **Response:**
    ```json
    {
        "countries": {
            "countryName1": [
                "cityName1",
                "cityName2"
            ],
            "countryName2": [
                "cityName1",
                "cityName2",
                "cityName3"
            ],
        }
    }

- **GET** `/airports`
  - Retrieves all/filtered airports (**filtering is recommended, otherwise response will be ~1MB in size**).
  - **Query Parameters:**
        - `city` (optional): Filters airports by city.
        - `country` (optional): Filters airports by country.
  - **Response:**
    ```json
    {
        "airports": [
            {
                "airport_code": "YCB",
                "airport_name": "Cambridge Bay",
                "city": "Cambridge Bay",
                "country": "Canada"
            },
            {
                "airport_code": "YKD",
                "airport_name": "Township Airport",
                "city": "Kincardine",
                "country": "Canada"
            },
        ]
    }

- **GET** `/flights`
  - Retrieves flights between two airports.
  - **Query Parameters:**
    - `origin` (required): Filters flights by origin airport.
    - `destination` (required): Filters flights by destination airport.
    - `departure_time` (optional): Filters flights by departure time.
    - `arrival_time` (optional): Filters flights by arrival time.
    - `min_price` (optional): Filters flights by minimum price.
    - `max_price` (optional): Filters flights by maximum price. 
    - **NOTE**: `min_price` and `max_price` must be used together.
  - **Response:**
    ```json
    [
      {
          "flight_id": 1211,
          "departure_airport": "KTW",
          "arrival_airport": "JFK",
          "departure_datetime": "2024-10-06T11:54:00Z",
          "arrival_datetime": "2024-10-06T20:00:00Z",
          "airplane_id": 4,
          "price": 295.47
      },
      {
          "flight_id": 1229,
          "departure_airport": "KTW",
          "arrival_airport": "JFK",
          "departure_datetime": "2024-10-23T03:06:00Z",
          "arrival_datetime": "2024-10-23T18:53:00Z",
          "airplane_id": 4,
          "price": 422.35
      }
    ]

- **POST** `/flights`
  - Creates a new flight.
  - **Request Body:**
    ```json
    {
      "origin": "Origin Airport Code",
      "destination": "Destination Airport Code",
      "departure_time": "Departure Time",
      "arrival_time": "Arrival Time",
      "airplane_id": 777,
      "price": "Price"
    }

- **GET** `/flights/:id`
  - Retrieves details of a specific flight.
  - **Query Parameters:** none
  - **Response:**
    ```json
    {
      "flight": {
          "flight_id": 6,
          "departure_airport": "POZ",
          "arrival_airport": "YQL",
          "departure_datetime": "2024-03-19T12:25:00Z",
          "arrival_datetime": "2024-03-19T15:00:00Z",
          "airplane_id": 4,
          "price": 298.40
      },
      "plane": {
          "airplane_id": 4,
          "airplane_model": "Embraer Phenom 100",
          "diagram_metadata": {
              "rows": 2,
              "columns": 2,
              "seatTypes": {
                  "default": {
                      "label": "Economy",
                      "price": 15,
                      "cssClass": "economy"
                  },
                  "first_class": {
                      "label": "First Class",
                      "price": 1200,
                      "cssClass": "first-class",
                      "seatRows": [0, 1]
                  }
              },
              "rowSpacers": [1],
              "columnSpacers": [1]
          }
      },
      "reserved": [
          {"row": 0,"col": 1},
          {"row": 0,"col": 0},
          {"row": 1,"col": 0}
      ]
    }

- **PATCH** `/flights/:id`
  - Updates details of a specific flight.
  - **Request Body:**
    **NOTE**: All fields are optional.
    ```json
    {
      "departure_time": "New Departure Time", 
      "arrival_time": "New Arrival Time", 
      "price": "New Price"
    }

- **GET** `/reservations`
  - Retrieves all reservations of the client.
  - **Query Parameters:**
    - `email` (required): Email of the client.
    - `firstname` (required): First name of the client.
    - `lastname` (required): Last name of the client.
  - **Response:**
    ```json
    {
      "reservations": [
          {
              "reservation": {
                  "reservation_id": 1,
                  "flight_id": 3,
                  "firstname": "Aaa",
                  "lastname": "Bbb",
                  "email": "aaa@email.com",
                  "reservation_datetime": "2024-04-28T17:57:42.210596Z",
                  "status": {
                      "reservation_status": "confirmed",
                      "valid": true
                  }
              },
              "departure_airport": "KTW",
              "arrival_airport": "SDU",
              "departure_datetime": "2024-12-17T06:30:00Z"
          },
          {
              "reservation": {
                  "reservation_id": 2,
                  "flight_id": 5,
                  "firstname": "Aaa",
                  "lastname": "Bbb",
                  "email": "aaa@email.com",
                  "reservation_datetime": "2024-04-28T17:57:48.304219Z",
                  "status": {
                      "reservation_status": "confirmed",
                      "valid": true
                  }
              },
              "departure_airport": "KRK",
              "arrival_airport": "JFK",
              "departure_datetime": "2024-12-17T06:30:00Z"
          }
      ]
    }

- **POST** `/reservations`
  - Creates a new reservation.
  - **Request Body:**
    ```json
    {
      "flight_id": "Flight ID",
      "firstname": "First Name",
      "lastname": "Last Name",
      "email": "Email",
      "seats": [
        {
          "row": 1,
          "col": 2
        },
        {
          "row": 2,
          "col": 1
        }
      ]
    }

- **GET** `/reservations/:id`
  - Retrieves details of a specific reservation.
  - **Query Parameters:** none
  - **Response:**
    ```json
    {
      "flight": {
          "flight_id": 3,
          "departure_airport": "KTW",
          "arrival_airport": "SDU",
          "departure_datetime": "2024-12-17T06:30:00Z",
          "arrival_datetime": "2024-12-17T12:30:00Z",
          "airplane_id": 1,
          "price": 631.44
      },
      "reservation": {
          "reservation_id": 1,
          "flight_id": 3,
          "firstname": "Aaa",
          "lastname": "Bbb",
          "email": "aaa@email.com",
          "reservation_datetime": "2024-04-28T18:48:15.517089Z",
          "status": {
              "reservation_status": "confirmed",
              "valid": true
          }
      },
      "seats": [
          {
              "seat_type": "economy",
              "row": 13,
              "col": 4
          }
      ]
    }

- **DELETE** `/reservations/:id`
  - Deletes a specific reservation.
  - **Query Parameters:** none

- **PATCH** `/reservations/:id`
  - Removes `seats` from a specified reservation.
  - **Request Body:**
    ```json
    {
      "seats": [
        {
          "row": 1,
          "col": 2
        },
        {
          "row": 2,
          "col": 1
          }
      ]
    }

- **GET** `/reports`
  - **Query parameters:**
    - `from` (required): Start date.
    - `to` (required): End date.
    - `limit` (required): Limit of `popular_flights` and `popular_destinations`.
  - **Response:**
    ```json
    {
      "periodic_earnings": [
          [
              1704067200000,
              33853.964
          ],
          [
              1704153600000,
              37519.099
          ],
        ],
      "popular_destinations": [
          {
              "arrival_airport": "WRO",
              "seat_count": 33
          },
          {
              "arrival_airport": "ILK",
              "seat_count": 30
          },
        ],
      "popular_flights": [
          {
              "departure_airport": "KRK",
              "arrival_airport": "WRO",
              "seat_count": 33
          },
          {
              "departure_airport": "IST",
              "arrival_airport": "ILK",
              "seat_count": 30
          },
        ],
      "tickets_sold": 6,
      "total_earnings": [
          {
              "seat_type": "economy",
              "value": 1232.1300
          },
          {
              "seat_type": "economy_plus",
              "value": 544.5120
          }
        ]
      }

**NOTE**: Structure of this codebase has been generated by [Autostrada](https://autostrada.dev/).
