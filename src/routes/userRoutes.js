const express = require("express");
require("dotenv").config();
const router = express.Router();
const { authenticateToken } = require("../middleware/authMiddleware");
const { login, signUp } = require("../controllers/User");
const { activateEKyc} = require("../utils/activateEKyc")
const payload = activateEKyc();

// router.post("/signup", signUp);
router.post("/auth", login);
// router.post("/auth", User.authenticateUser);

router.get("/services", authenticateToken, (req, res) => {
	const {user_code} = req.user;

	// Access the authenticated user data from req.user
	res.render("services", {
		PARTNER_NAME: process.env.PARTNER_NAME,
		INITIATOR_LOGO: process.env.INITIATOR_LOGO,
		INITIATOR_ID: process.env.INITIATOR_ID,
		DEVELOPER_KEY: process.env.DEVELOPER_KEY,
		AEPS_SECRET_KEY: `${payload.secret_key}`,
		SECRET_KEY_TIMESTAMP : payload.secret_key_timestamp,
		USER_CODE : req.user.user_code
	});
});

module.exports = router;