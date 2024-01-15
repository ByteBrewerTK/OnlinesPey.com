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
				message: "fields can't be empty",
			});
		}

		const userDetails = await User.findOne({ email: email });

		if (userDetails) {
			return res.status(400).json({
				message: "user already exists",
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
			message: "Error occured while creating user",
			error: error.message,
		});
	}
};

exports.login = async (req, res) => {
	try {
		const { phone, password } = req.body;

		const userDetails = await User.findOne({ phone: phone });

		if(!phone || !password) {
			let errorMessage = "field can't be empty";
			return res.status(404).render("auth", { errorMessage });
		}

		if (!userDetails) {
			let errorMessage = "user not found";
			return res.status(404).render("auth", { errorMessage });
		}

		if (userDetails.password !== password) {
			let errorMessage = "incorrect password";
			return res.status(401).render("auth", { errorMessage });
		}

		const payload = {
			name: userDetails.name,
			email: userDetails.email,
			user_code: userDetails.user_code,
		};

		jwt.sign(payload, SECRETE_KEY, { expiresIn: "1h" }, (err, token) => {
			if (err) {
				let errorMessage = "internal error";
				console.error(err);
				return res.status(5000).render("auth", { errorMessage });
			}
			res.cookie("authToken", token, {
				httpOnly: true, // Make the cookie accessible only via HTTP(S)
				maxAge: 6000, // Cookie expiration time
			});

			return res.status(304).redirect("/services");
		});
	} catch (error) {
		console.error(error);
		let errorMessage = "Internal error";
		return res.status(500).render("auth", { errorMessage });
	}
};
