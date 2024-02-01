const User = require("../models/User");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRETE_KEY = process.env.SECRETE_KEY;

exports.signUp = async (req, res) => {
	try {
		const { name, email, phone } = req.body;

		if (!name || !email || !phone) {
			return res.status(400).json({
				success: false,
				message: "Fields can't be empty",
			});
		}

		const userDetails = await User.findOne({ email: email });

		if (userDetails) {
			return res.status(400).json({
				success: false,
				message: "User already exists",
			});
		}

		const userData = await User.create({
			name,
			email,
			phone,
		});

		return res.status(200).json({
			success: true,
			data: userData,
		});
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: "Error occurred while creating user",
			error: error.message,
		});
	}
};

exports.login = async (req, res) => {
	try {
		const { phone, password } = req.body;

		const userDetails = await User.findOne({ phone: phone });

		if (!phone || !password) {
			return res.status(400).json({
				success: false,
				message: "Phone and password are required",
			});
		}

		if (!userDetails) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		if (userDetails.password !== password) {
			return res.status(401).json({
				success: false,
				message: "Incorrect password",
			});
		}

		const payload = {
			name: userDetails.name,
			email: userDetails.email,
			user_code: userDetails.user_code,
		};

		jwt.sign(payload, SECRETE_KEY, { expiresIn: "1h" }, (err, token) => {
			if (err) {
				console.error(err);
				return res.status(500).json({
					success: false,
					message: "Internal error",
					error: err.message,
				});
			}
			res.cookie("authToken", token, {
				httpOnly: true,
				maxAge: 3600000, // 1 hour in milliseconds
			});

			return res.status(200).json({
				success: true,
				message: "Successfully logged in",
				accessToken: token,
			});
		});
	} catch (error) {
		console.error(error);
		return res.status(500).json({
			success: false,
			message: "Internal error",
			error: error.message,
		});
	}
};
exports.getAllUsers = async (req, res) => {
	try {
		// Assuming you are using Mongoose as the ODM
		const users = await User.find();

		// Return the list of users in the response
		res.status(200).json({
			success : true,
			data : users,
		});
	} catch (error) {
		console.error("Error fetching users:", error);
		res.status(500).json({ error: "Internal Server Error" });
	}
};
