const { db, auth } = require("../config/firebase");
const { createUserWithEmailAndPassword, signInWithEmailAndPassword } = require("firebase/auth");
const { doc, setDoc } = require("firebase/firestore");

// Register a new user
const registerUser = async (req, res) => {
  const { email, password, name, phone } = req.body;

  try {
    // Create user in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log("User created successfully:", user.uid);

    // Save additional user details to Firestore
    await setDoc(doc(db, "users", user.uid), {
      name,
      email,
      phone,
      createdAt: new Date(),
    });

    console.log("User details saved to Firestore: ", user.uid);
    res.status(201).json({ message: "User registered successfully", userId: user.uid });
  } catch (error) {
    console.error("Error registering user:", error.message);
    res.status(400).json({ error: error.message });
  }
};

// User login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log("Login successful for user ID:", user.uid);
    res.status(200).json({ message: "Login successful", userId: user.uid });
  } catch (error) {
    console.error("Error logging in user:", error.message);
    res.status(401).json({ error: error.message });
  }
};

module.exports = { registerUser, loginUser };
