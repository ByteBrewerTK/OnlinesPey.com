// models/RefreshToken.js
const mongoose = require("mongoose");

const refreshTokenSchema = new mongoose.Schema({
	token: {
		type: String,
		required: true,
		unique: true,
	},
	userId: {
		type: String,
		required: true,
	},
});

const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);

module.exports = RefreshToken;
