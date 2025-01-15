const express = require("express");
const { getWeatherByCity, getWeatherForecast, getWeatherAndActivities, manageFavorites } = require("../controllers/weatherController");

const router = express.Router();

// Route for getting weather by city
router.get("/weather", getWeatherByCity);

// Route for getting 7-day weather forecast by city
router.get("/7-day-forecast", getWeatherForecast);

// Route for getting weather with activity recommendations
router.get("/weather-activities", getWeatherAndActivities);

// Route for managing favorites
router.post("/favorites", manageFavorites);

module.exports = router;
