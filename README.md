# Supplier Merge

This is a NodeJS / Express web server that retrieves supplier information about hotels and delivers processed data to an API endpoint.

## Assumptions
1. There are three suppliers: ACME, Patagonia and Paperflies, additional supplier may require new cleaning techniques.
2. Matching of IDs are clean & sanitized - all supplier endpoints given have the same matching hotel & destination IDs
3. Each supplier's existing fields will not change, additional fields may be added.
4. Supplier information is relatively static and takes longer than 5 minutes to refresh.

## Solution

1. Merge hotel data of different suppliers
    - Download supplier information to disk, and load the merged data into in-app memory and cache (provided source data is reasonably small - less than 500 MB)
    - Create a Hotel object to maintain type and field consistency
2. Parse and clean dirty data
    - Convert PascalCase to snake_case or lower case tags
    - Standardise and ensure all fields have the same name and format
3. Rules to represent data
    - Select the longest name, description and address amongst the three suppliers, trusting it provides the most amount of information relevant to the user
    - Extract geocoordinates and city from Patagonia or Acme
    - Combine the amenities data and rename fields for the various suppliers and remove duplicates (after trimming whitespace), where Patagonia amenities refer more to room amenities, and Acme facilties are better suited for general amenities.
    - Remove general amenities if they are already present in room amenities for better specificity
    - Combine the image data fields (rooms, sites, amenities) from Paperflies and Patagonia, and remove duplicate image URLs.
    - Take booking conditions from Paperflies.
4. API endpoint that allows us to query the hotels data with some simple filtering
    - Endpoint needs to accept following parameters: destination, hotels
    - Store search values as cache keys for faster query performance

### Performance
1. Data procurement
    - Fetch the supplier information in parallel - this will take less time to download all the supplier information over the network compared to sequential fetch.
    - Load the supplier information and transform the data once, then save the merged data into a cache, so we do not need to make repeated calls to the supplier APIs and perform multiple expensive merges. We may modify the cache expiry period depending on the update frequency.
2. Data delivery
    - Merge-on-write, and not merge-on-read so no additional processing is needed for the read queries, and the API endpoint can respond more quickly. This is preferred assuming that frequency of read requests far outweigh any frequency of changes in the source data.
    - When queries are made, save the request parameters and their corresponding responses to a cache. If the query is repeated, we can retrieve the data from the cache, thereby improving response time as we do not need to continuously filter data based on incoming requests.

 Note: Improving performance by being considerate to supplier API and reducing response time comes at the cost of potentially stale data, eg when supplier API is updated, it may take X * 2 time (where X = cache expiry) for the new data to be propagated to the client.

## Specifications

### Query hotels

Endpoint

```text
GET /query[?destination=<destination>&hotels=<hotels>]
```

Parameters

| Parameter     | Description                                        |
| ------------- | -------------------------------------------------- |
| `destination` | (Optional) Destination ID (eg. 1122 or 5432)       |
| `hotels`      | (Optional) List of hotel IDs (eg. iJhz or f8c9)    |

Retrieving readings using CURL

```console
$ curl "http://localhost:3000/query?hotels=iJhz"
$ curl "http://localhost:3000/query?destination=1122"
$ curl "http://localhost:3000/query?destination=5432&hotels=iJhz,SjyX"
```

Example output

```
[
  {
    "id": "iJhz",
    "destination": 5432,
    "name": "Beach Villas Singapore",
    "description": "Located at the western tip of Resorts World Sentosa, guests at the Beach Villas are guaranteed privacy while they enjoy spectacular views of glittering waters. Guests will find themselves in paradise with this series of exquisite tropical sanctuaries, making it the perfect setting for an idyllic retreat. Within each villa, guests will discover living areas and bedrooms that open out to mini gardens, private timber sundecks and verandahs elegantly framing either lush greenery or an expanse of sea. Guests are assured of a superior slumber with goose feather pillows and luxe mattresses paired with 400 thread count Egyptian cotton bed linen, tastefully paired with a full complement of luxurious in-room amenities and bathrooms boasting rain showers and free-standing tubs coupled with an exclusive array of ESPA amenities and toiletries. Guests also get to enjoy complimentary day access to the facilities at Asia’s flagship spa – the world-renowned ESPA.",
    "location": {
      "address": "8 Sentosa Gateway, Beach Villas, 098269",
      "lat": 1.264751,
      "lng": 103.824006,
      "city": "Singapore",
      "country": "Singapore"
    },
    "amenities": {
      "room": [
        "tv",
        "coffee machine",
        "kettle",
        "hair dryer",
        "iron",
        "aircon",
        "tub"
      ],
      "general": [
        "outdoor pool",
        "indoor pool",
        "business center",
        "childcare",
        "pool",
        "wi fi",
        "dry cleaning",
        "breakfast"
      ]
    },
"images": {
      "site": [
        {
          "link": "https://d2ey9sqrvkqdfs.cloudfront.net/0qZF/1.jpg",
          "description": "Front"
        }
      ],
      "rooms": [
        {
          "link": "https://d2ey9sqrvkqdfs.cloudfront.net/0qZF/2.jpg",
          "description": "Double room"
        },
        {
          "link": "https://d2ey9sqrvkqdfs.cloudfront.net/0qZF/3.jpg",
          "description": "Double room"
        },
        {
          "description": "Bathroom",
          "link": "https://d2ey9sqrvkqdfs.cloudfront.net/0qZF/4.jpg"
        }
      ],
      "amenities": [
        {
          "description": "RWS",
          "link": "https://d2ey9sqrvkqdfs.cloudfront.net/0qZF/0.jpg"
        },
        {
          "description": "Sentosa Gateway",
          "link": "https://d2ey9sqrvkqdfs.cloudfront.net/0qZF/6.jpg"
        }
      ]
    },
    "booking_conditions": [
      "All children are welcome. One child under 12 years stays free of charge when using existing beds. One child under 2 years stays free of charge in a child's cot/crib. One child under 4 years stays free of charge when using existing beds. One older child or adult is charged SGD 82.39 per person per night in an extra bed. The maximum number of children's cots/cribs in a room is 1. There is no capacity for extra beds in the room.",
      "Pets are not allowed.",
      "WiFi is available in all areas and is free of charge.",
      "Free private parking is possible on site (reservation is not needed).",
      "Guests are required to show a photo identification and credit card upon check-in. Please note that all Special Requests are subject to availability and additional charges may apply. Payment before arrival via bank transfer is required. The property will contact you after you book to provide instructions. Please note that the full amount of the reservation is due before arrival. Resorts World Sentosa will send a confirmation with detailed payment information. After full payment is taken, the property's details, including the address and where to collect keys, will be emailed to you. Bag checks will be conducted prior to entry to Adventure Cove Waterpark. === Upon check-in, guests will be provided with complimentary Sentosa Pass (monorail) to enjoy unlimited transportation between Sentosa Island and Harbour Front (VivoCity). === Prepayment for non refundable bookings will be charged by RWS Call Centre. === All guests can enjoy complimentary parking during their stay, limited to one exit from the hotel per day. === Room reservation charges will be charged upon check-in. Credit card provided upon reservation is for guarantee purpose. === For reservations made with inclusive breakfast, please note that breakfast is applicable only for number of adults paid in the room rate. Any children or additional adults are charged separately for breakfast and are to paid directly to the hotel."
    ]
  }
]
```

### Health check

Endpoint

```text
GET /health
```

Retrieving readings using CURL

```console
$ curl "http://localhost:3000/health"
```

Example output

```
OK
```

## Running the app

The project requires Node 22. The web server is configured to run on port 3000.

### Install
```
npm install
```

### Test

```
npm test
```

### Development with `nodemon` refresh

```
npm run dev
```

### Build

```
npm run build
```

### Start

```
npm start
```

## Deployment with Docker

### Build container
```
docker build -t hotel-merge .
```

### Run container
```
docker run -it -p 3000:3000 hotel-merge
```