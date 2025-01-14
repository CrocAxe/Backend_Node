require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { db, auth } = require("./config/firebase");
const userRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const verifyAuth = require("./middleware/authMiddleware")
const app = express();
app.use(express.json());
app.use(cors());

// Routes for Users
app.use("/users", userRoutes);
app.use("/profile", verifyAuth, profileRoutes);

// Default Route
app.get("/", (req, res) => {
  res.send("Welcome to the Weather Planner App Backend!");
});

// Server Listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
