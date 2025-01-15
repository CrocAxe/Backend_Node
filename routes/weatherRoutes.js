const express = require("express");
const {getLocationDetails, getCurrentLocationDetails} = require("../controllers/weatherController");
const router = require("./authRoutes");

// City search endpoint
router.get("/location", getLocationDetails);

// Current location endpoint
router.get("/current-location", getCurrentLocationDetails);

module.exports = router;
