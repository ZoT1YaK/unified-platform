const jwt = require("jsonwebtoken");

// Verify JWT
exports.verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Get token from 'Authorization: Bearer <token>'
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded payload (e.g., id, is_people_leader) to the request
    next();
  } catch (error) {
    res.status(403).json({ message: "Invalid or expired token." });
  }
};

// Verify People Leader Role
exports.verifyPeopleLeader = (req, res, next) => {
  if (!req.user.is_people_leader) {
    return res.status(403).json({ message: "Access denied, only People Leaders can perform this action" });
  }
  next();
};

// Verify Admin Role
exports.verifyAdmin = (req, res, next) => {
  if (!req.user.is_admin) {
    return res.status(403).json({ message: "Access denied, only Admins can perform this action" });
  }
  next();
};