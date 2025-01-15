# Google Reviews API Caching Service

This project is an Express.js-based backend service that fetches and caches Google Place reviews. The service uses the Google Places API to retrieve reviews for a specified `placeId`, caches the responses to optimize API usage, and provides endpoints to fetch and refresh reviews.

---

## Features

- Fetch Google Place reviews using the Google Places API.
- Cache responses to reduce redundant API calls.
- Automatically refresh the cache once per day.
- Provide a manual cache refresh endpoint.

---

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- A valid Google Cloud API key with access to the Places API.

---

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file and add your Google API key:
   ```env
   GOOGLE_API_KEY=your_google_api_key
   ```

4. Start the server:
   ```bash
   npm start
   ```

The server will run on `http://localhost:3000` by default.

---

## Endpoints

### 1. `GET /reviews`

**Description:** Fetch reviews for a specific place. If the reviews are cached and valid (within 24 hours), they will be served from the cache.

**Query Parameters:**
- `placeId` (required): The Google Place ID for which reviews are fetched.

**Example Request:**
```bash
curl "http://localhost:3000/reviews?placeId=ChIJN1t_tDeuEmsRUsoyG83frY4"
```

**Response:**
```json
{
   "reviews":[ 
    {
        "author_name": "Tim Kemmy",
        "author_url": "https://www.google.com/maps/contrib/115632640353484101711/reviews",
        "language": "en",
        "original_language": "en",
        "profile_photo_url": "https://lh3.googleusercontent.com/a/ACg8ocLtFdF9D3XZ22qRhiXLz4lVGMvhy6jk3Rpw7JmaHEkIYZK1ig=s128-c0x00000000-cc-rp-mo",
        "rating": 5,
        "relative_time_description": "2 months ago",
        "text": "Very impressed! Simply couldn't have been more accommodating.",
        "time": 1730921980,
        "translated": false
    }
    ],
    "totalReviews": 88,
    "averageRating": 5,
    "leaveAReviewURL": "https://search.google.com/local/writereview?placeid=ChIJRQuKLcaj54gRgLJyrT5Xzo8",
    "lastFetched": "2025-01-15T21:39:56.481Z",
}
```

### 2. `GET /refresh-reviews`

**Description:** Force refresh the cached reviews for a specific place by fetching new data from the Google Places API.

**Query Parameters:**
- `placeId` (required): The Google Place ID for which reviews are refreshed.

**Example Request:**
```bash
curl "http://localhost:3000/refresh-reviews?placeId=ChIJN1t_tDeuEmsRUsoyG83frY4"
```

**Response:**
```json
{
    "message": "Cache updated successfully",
    "reviews": [
        {
            "author_name": "Tim Kemmy",
        "author_url": "https://www.google.com/maps/contrib/115632640353484101711/reviews",
        "language": "en",
        "original_language": "en",
        "profile_photo_url": "https://lh3.googleusercontent.com/a/ACg8ocLtFdF9D3XZ22qRhiXLz4lVGMvhy6jk3Rpw7JmaHEkIYZK1ig=s128-c0x00000000-cc-rp-mo",
        "rating": 5,
        "relative_time_description": "2 months ago",
        "text": "Very impressed! Simply couldn't have been more accommodating.",
        "time": 1730921980,
        "translated": false
        }
         "totalReviews": 88,
    "averageRating": 5,
    "leaveAReviewURL": "https://search.google.com/local/writereview?placeid=ChIJRQuKLcaj54gRgLJyrT5Xzo8",
    "lastFetched": "2025-01-15T21:39:56.481Z",
    ]
}
```

### 3. `GET /`

**Description:** Health check endpoint to confirm that the server is running.

**Example Request:**
```bash
curl "http://localhost:3000/"
```

**Response:**
```text
Server Running
```

---

## Project Structure

```
project-folder/
├── cache.js               # Cache module for storing reviews and timestamps
├── server.js              # Main Express server file
├── .env                   # Environment variables
├── package.json           # Node.js dependencies
└── README.md              # Project documentation
```

---

## Caching Logic

- Cached data is stored in a simple in-memory JavaScript object (`cache.js`).
- Cache is refreshed if:
  - No cached data exists.
  - Cached data is older than 24 hours.

---

## Future Enhancements

- Add database support for persistent caching.
- Support additional fields from the Google Places API.
- Add authentication for secure API usage.
- Implement rate-limiting to prevent abuse.

---
