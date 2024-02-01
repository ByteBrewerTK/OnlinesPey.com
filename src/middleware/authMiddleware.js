// authMiddleware.js

const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRETE_KEY = process.env.SECRETE_KEY; // Replace with your secret key

exports.authenticateToken = (req, res, next) => {
	const token =
		(req.headers.authorization &&
			req.headers.authorization.split(" ")[1]); // Retrieve token from Authorization header

	if (!token || token === "") {
		// Token is missing or invalid
		return res.status(401).json({ error: "Unauthorized" }); // Send 401 Unauthorized response
	}

	jwt.verify(token, SECRETE_KEY, (err, decoded) => {
		if (err) {
			// Invalid token
			return res.status(401).json({ error: "Unauthorized" }); // Send 401 Unauthorized response
		}
		req.user = decoded; // Attach decoded user information to request object

		next(); // Proceed to the next middleware or route handler
	});
};
