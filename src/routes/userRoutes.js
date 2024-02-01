const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const { login, signUp, getAllUsers } = require("../controllers/User");


// Handle POST request for user authentication
router.post("/auth", login);
router.get("/users", authenticateToken, getAllUsers);

// Handle GET request for services (authenticated)
router.get("/services", authenticateToken, (req, res) => {
	const { user_code } = req.user;

	// Send JSON response with required data
	res.json({
		PARTNER_NAME: process.env.PARTNER_NAME,
		INITIATOR_LOGO: process.env.INITIATOR_LOGO,
		INITIATOR_ID: process.env.INITIATOR_ID,
		DEVELOPER_KEY: process.env.DEVELOPER_KEY,
		AEPS_SECRET_KEY: payload.secret_key,
		SECRET_KEY_TIMESTAMP: payload.secret_key_timestamp,
		USER_CODE: req.user.user_code,
	});
});

module.exports = router;
