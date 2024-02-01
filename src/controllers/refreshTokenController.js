// controllers/refreshTokenController.js
const jwt = require("jsonwebtoken");
const RefreshToken = require("../models/RefreshToken");
const mongoose = require("mongoose");
require("dotenv").config();

const SECRET_KEY = process.env.SECRET_KEY ;
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || "15m";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";

exports.refreshToken = async (req, res) => {
	const refreshToken = req.body.refreshToken;

	// Check if refresh token is valid
	if (!refreshToken) {
		return res.status(401).json({ error: "Invalid refresh token" });
	}

	try {
		// Verify the refresh token and get the user ID
		const decoded = jwt.verify(refreshToken, SECRET_KEY);
		const userId = decoded.userId;

		// Check if the refresh token exists in the database
		const existingRefreshToken = await RefreshToken.findOne({
			token: refreshToken,
			userId,
		});

		if (!existingRefreshToken) {
			return res.status(401).json({ error: "Invalid refresh token" });
		}

		// Generate a new access token and refresh token
		const newAccessToken = jwt.sign(
			{ userId: decoded.userId },
			SECRET_KEY,
			{
				expiresIn: ACCESS_TOKEN_EXPIRY,
			}
		);
		const newRefreshToken = jwt.sign(
			{ userId: decoded.userId },
			SECRET_KEY,
			{
				expiresIn: REFRESH_TOKEN_EXPIRY,
			}
		);

		// Update the refresh token in the database
		await RefreshToken.findOneAndUpdate(
			{ token: refreshToken, userId },
			{ token: newRefreshToken }
		);

		// Send back the new access token and refresh token
		res.json({
			accessToken: newAccessToken,
			refreshToken: newRefreshToken,
		});
	} catch (error) {
		return res.status(401).json({ error: "Invalid refresh token" });
	}
};
