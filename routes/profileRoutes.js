const express = require("express");
const { getProfile, updateProfile, addFavorite, getFavorites, removeFavorite } = require("../controllers/profileController");

const router = express.Router();

router.get("/get-profile", getProfile);
router.post("/update-profile", updateProfile);
router.post('/add-favorites', addFavorite);
router.delete('/favorites/:placeId', removeFavorite);
router.get('/favorites', getFavorites);

module.exports = router;
