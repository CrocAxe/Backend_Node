const express = require("express");
const { getProfile, updateProfile } = require("../controllers/profileController");

const router = express.Router();

router.get("/get-profile", getProfile);
router.post("/update-profile", updateProfile);

module.exports = router;
