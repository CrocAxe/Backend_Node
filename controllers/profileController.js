const { db } = require("../config/firebase");
const { doc, getDoc, updateDoc } = require("firebase/firestore");


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



module.exports = { getProfile,  updateProfile};
