const express = require("express");
const axios = require("axios");
const cors = require("cors");
const cache = require("./cache");
require("dotenv").config();

const app = express();
const PORT = 3000;

app.use(cors());

const fetchReviewsFromGoogle = async (placeId) => {
    try {
        const response = await axios.get(
            `https://maps.googleapis.com/maps/api/place/details/json`,
            {
                params: {
                    place_id: placeId,
                    key: process.env.GOOGLE_API_KEY,
                    fields: "reviews,user_ratings_total,rating",
                    reviews_sort: "newest",
                },
            }
        );

        const result = response.data.result;

        // Handle missing result or reviews
        if (!result) {
            throw new Error("Invalid placeId or no data returned for the place.");
        }

        if (!result.reviews) {
            throw new Error("No reviews available for the given place.");
        }

        // Update the cache
        cache.reviews = result.reviews;
        cache.totalReviews = result.user_ratings_total;
        cache.averageRating = result.rating;
        cache.leaveAReviewURL = `https://search.google.com/local/writereview?placeid=${placeId}`;
        cache.lastFetched = new Date();

        return {
            reviews: cache.reviews,
            totalReviews: result.user_ratings_total || 0, // Default to 0 if not available
            averageRating: result.rating || 0, // Default to 0 if not available
            leaveAReviewURL: `https://search.google.com/local/writereview?placeid=${placeId}`
        };
    } catch (error) {
        if (error.response) {
            // Errors from the API
            const { status, data } = error.response;
            console.error(`API Error: ${status} - ${data.error_message || data}`);
            throw new Error(`Google API error: ${data.error_message || "Unknown error"}`);
        } else if (error.request) {
            // No response from the API
            console.error("No response from Google API:", error.request);
            throw new Error("Failed to connect to Google API. Please try again later.");
        } else {
            // Other errors (e.g., code bugs)
            console.error("Unexpected error:", error.message);
            throw new Error("An unexpected error occurred.");
        }
    }
};

// Route to fetch reviews, using cache
app.get("/reviews", async (req, res) => {
    const { placeId } = req.query;

    if (!placeId) {
        return res.status(400).json({ error: "placeId is required" });
    }

    // Check if cache is still valid (1 day = 24 hours = 86400000 ms)
    const isCacheValid =
        cache.reviews &&
        cache.lastFetched &&
        new Date() - cache.lastFetched < 86400000;

    if (isCacheValid) {
        console.log("Serving reviews from cache");
        return res.json(cache);
    }

    try {
        console.log("Fetching new reviews from Google");
        const reviews = await fetchReviewsFromGoogle(placeId);
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch reviews" });
    }
});

// Route to force refresh the cache
app.get("/refresh-reviews", async (req, res) => {
    const { placeId } = req.query;

    if (!placeId) {
        return res.status(400).json({ error: "placeId is required" });
    }

    try {
        console.log("Manually refreshing reviews from Google");
        const reviews = await fetchReviewsFromGoogle(placeId);
        res.json({ message: "Cache updated successfully", reviews });
    } catch (error) {
        res.status(500).json({ error: "Failed to refresh reviews" });
    }
});



app.get('/', async (req,res) => {
    res.send('Server Runnings')
})

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
