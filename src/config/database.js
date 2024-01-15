const mongoose = require("mongoose");
require("dotenv").config();

const DATABASE_URL = process.env.DATABASE_URL;

const connectDB = () => {
	mongoose
		.connect(DATABASE_URL)
		.then(console.log("DB connection successful"))
		.catch((error) => {
			console.log(error);
			console.log("DB connection failed");
			process.exit(1);
		});
};

module.exports = connectDB;
