const express = require("express");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");
const path = require("path");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const connectDB = require("./config/database");
const rateLimit = require("express-rate-limit");
// const { activateEKyc } = require("./utils/activateEKyc");
const serverless = require("serverless-http");
const cors  = require("cors");
const { handleAePSCallback } = require("./utils/callbackHandler");

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration
dotenv.config();
connectDB();

// Middleware
app.use(bodyParser.json()); // Parse JSON requests
app.use(cookieParser());
app.use(cors());
app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "https://stagegateway.eko.in");
	res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
	res.setHeader("Access-Control-Allow-Headers", "Content-Type");
	next();
});

// View Engine Setup (removed for API)
// app.set("view engine", "hbs");
// const staticPath = path.join(__dirname, "../public");
// app.use(express.static(staticPath));

// Routes
app.get("/", (req, res) => {
	res.json({ message: "Welcome to the API!" });
});


// Removed HTML rendering routes
// app.get("/contact", (req, res) => {
//   res.render("contact");
// });

// app.get("/auth", (req, res) => {
//   if (req.user) {
//     return res.redirect("/services");
//   }
//   res.render("auth");
// });

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 50, // limit each IP to 50 requests per windowMs
});

// Apply to specific routes or globally
// app.use("/api/", limiter);
app.use("/api", userRoutes); // User routes from external file

// Error handling for unmatched routes
app.use((req, res) => {
	res.status(404).json({ error: "Not Found" });
});

// Start the server
app.listen(PORT, () => {
	console.log(`Server started on port ${PORT}`);
});

// Export the app for serverless deployment (if needed)
module.exports.handler = serverless(app);
