const express = require("express");
const bodyParser = require("body-parser");
const userRoutes = require("./routes/userRoutes");
const path = require("path");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const connectDB = require("./config/database");
const rateLimit = require("express-rate-limit");
const {activateEKyc} = require("./utils/activateEKyc");

const app = express();
const PORT = process.env.PORT || 3000;

// Configuration
dotenv.config();
connectDB();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// View Engine Setup
app.set("view engine", "hbs");
const staticPath = path.join(__dirname, "../public");
app.use(express.static(staticPath));

// Routes
app.get("/", (req, res) => {
	res.render("index");
});
app.get("/contact", (req, res) => {
	res.render("contact");
});

app.get("/auth", (req, res) => {
	if (req.user) {
		return res.redirect("/services");
	}
	res.render("auth"); // Render login form using your template engine
});

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 50, // limit each IP to 50 requests per windowMs
});

// Apply to specific routes or globally
app.use("/api/", limiter);
app.use("/", userRoutes); // User routes from external file

// Start the server
app.use((req, res) => {
	res.status(404).render("error"); 
});
app.listen(PORT, () => {
	console.log(`Server started on port ${PORT}`);
});

