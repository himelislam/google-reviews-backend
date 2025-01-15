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
                    fields: "reviews",
                },
            }
        );

        const result = response.data.result;
        if (!result || !result.reviews) {
            throw new Error("No reviews found or invalid placeId");
        }

        // Update the cache
        cache.reviews = result.reviews;
        cache.lastFetched = new Date();

        return cache.reviews;
    } catch (error) {
        console.error("Error fetching reviews:", error.message);
        throw error;
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
        return res.json(cache.reviews);
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
