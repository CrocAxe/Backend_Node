const { db } = require("../config/firebase");
const { doc, getDoc, updateDoc, arrayRemove, arrayUnion } = require("firebase/firestore");


const getProfile = async (req, res) => {
  const userId = req.user.uid;

  try {
    // Reference to the user's document in Firestore
    const userRef = doc(db, "users", userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return the user profile data
    res.status(200).json({ profile: userDoc.data() });
  } catch (error) {
    console.error("Error fetching user profile:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};


const updateProfile = async (req, res) => {
    const { name, phone, photoURL } = req.body;
    const userId = req.user.uid;

    try {
        const userRef = doc(db, "users", userId);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            return res.status(404).json({ error: "User not found" });
        }

        // Create update object
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (phone !== undefined) updateData.phone = phone;
        if (photoURL !== undefined) updateData.photoURL = photoURL;

        // Update the document
        await updateDoc(userRef, updateData);
        
        res.status(200).json({ 
            message: "Profile updated successfully",
            updatedFields: Object.keys(updateData)
        });
    } catch (error) {
        console.error("Error updating profile:", error.message);
        res.status(500).json({ error: error.message });
    }
};


// Updated function to add a recommended place to favorites
const addFavorite = async (req, res) => {
  const userId = req.user.uid;
  const { place } = req.body;

  if (!place || !place.name) {
      return res.status(400).json({ error: "Place information is required" });
  }

  try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
          return res.status(404).json({ error: "User not found" });
      }

      // Create favorite place object with all relevant details
      const favoritePlace = {
          id: place.name.toLowerCase().replace(/\s+/g, '-'), // Create a unique ID
          name: place.name,
          category: place.category,
          address: place.address,
          coordinates: place.coordinates,
          addedAt: new Date().toISOString()
      };

      // Add the place to favorites array
      await updateDoc(userRef, {
          favorites: arrayUnion(favoritePlace)
      });

      res.status(200).json({
          message: "Place added to favorites",
          addedPlace: favoritePlace
      });
  } catch (error) {
      console.error("Error adding favorite:", error.message);
      res.status(500).json({ error: error.message });
  }
};

// Updated function to remove a place from favorites
const removeFavorite = async (req, res) => {
  const userId = req.user.uid;
  const { placeId } = req.params;

  if (!placeId) {
      return res.status(400).json({ error: "Place ID is required" });
  }

  try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
          return res.status(404).json({ error: "User not found" });
      }

      const favorites = userDoc.data().favorites || [];
      const favoriteToRemove = favorites.find(fav => fav.id === placeId);

      if (!favoriteToRemove) {
          return res.status(404).json({ error: "Place not found in favorites" });
      }

      // Remove the place from favorites array
      await updateDoc(userRef, {
          favorites: arrayRemove(favoriteToRemove)
      });

      res.status(200).json({
          message: "Place removed from favorites",
          removedPlace: favoriteToRemove
      });
  } catch (error) {
      console.error("Error removing favorite:", error.message);
      res.status(500).json({ error: error.message });
  }
};

// Function to get all favorite places
const getFavorites = async (req, res) => {
  const userId = req.user.uid;

  try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
          return res.status(404).json({ error: "User not found" });
      }

      const favorites = userDoc.data().favorites || [];

      res.status(200).json({
          favorites: favorites.sort((a, b) => 
              new Date(b.addedAt) - new Date(a.addedAt)
          )
      });
  } catch (error) {
      console.error("Error fetching favorites:", error.message);
      res.status(500).json({ error: error.message });
  }
};



module.exports = { getProfile,  updateProfile, addFavorite, getFavorites, removeFavorite};
