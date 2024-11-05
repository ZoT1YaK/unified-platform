const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Login a user with email and password
exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Check if both email and password are provided
  if (!email || !password) {
    return res.status(400).json({ message: "Please provide email and password" });
  }

  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if password is correct
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET,{ 
      expiresIn: "1h" 
    });

    // Respond with token and user information
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } 
  catch (error) {
    console.error("Error logging in user:", error);
    res.status(500).json({ message: "Server error" });
  }
};