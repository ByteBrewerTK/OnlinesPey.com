// authMiddleware.js

const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRETE_KEY = process.env.SECRETE_KEY; // Replace with your secret key

exports.authenticateToken = (req, res, next) => {
	const token = req.cookies.authToken || ""; // Retrieve token from cookies

	if (!token || token === "") {
		// Token is missing or invalid
		return res.redirect("/auth"); // Redirect to login page
	}

	jwt.verify(token, SECRETE_KEY, (err, decoded) => {
		if (err) {
			// Invalid token
			return res.redirect("/auth"); // Redirect to login page
		}
		req.user = decoded; // Attach decoded user information to request object

		next(); // Proceed to the next middleware or route handler
	});
};
