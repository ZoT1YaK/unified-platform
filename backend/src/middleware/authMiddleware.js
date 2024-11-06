const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1]; // Get token from 'Authorization: Bearer <token>'

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
        req.user = decoded; // Attach the decoded user data to the request
        next(); // Proceed to the next middleware or route handler
    } 
    catch (error) {
        res.status(403).json({ message: "Invalid or expired token." });
    }
};

module.exports = verifyToken;
