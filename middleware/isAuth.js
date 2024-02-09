const jwt = require("jsonwebtoken");
const User = require('../models/user')
const dotenv = require("dotenv");

dotenv.config();

exports.authenticateUser = (req, res, next) => {
  try {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
      const error = new Error("Not authenticated.");
      error.statusCode = 401;
      throw error;
    }
    const token = authHeader.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }
    jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
      if (err) {
        return res.status(401).json({ message: "Invalid token." });
      }

      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(401).json({ message: "User not found." });
      }

      req.user = user;
      next();
    });
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
