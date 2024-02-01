// callbackHandler.js
const crypto = require("crypto");

// Function to handle AePS Gateway callback data
function handleAePSCallback(callbackData, transactionsDatabase) {
	const { action, detail } = callbackData;

	if (action === "debit-hook") {
		return handleTransactionIntimation(detail, transactionsDatabase);
	} else if (action === "eko-response") {
		return handleTransactionResponse(detail, transactionsDatabase);
	}

	// For other actions, you may handle as needed
	return { status: "success" };
}

// Function to handle Transaction Intimation
function handleTransactionIntimation(detail, transactionsDatabase) {
	// Your logic to verify transaction details and store in the database

	// Example: Storing in-memory for demonstration purposes, replace with your database logic
	transactionsDatabase[detail.client_ref_id] = {
		status: "pending",
		// Store other relevant details
	};

	// Return a valid confirmation response
	return {
		action: "go",
		allow: true,
		secret_key_timestamp: Date.now().toString(),
		request_hash: generateRequestHash(detail),
		secret_key: "your_secret_key", // Replace with your actual secret key
	};
}

// Function to handle Transaction Response
function handleTransactionResponse(detail, transactionsDatabase) {
	// Your logic to store/update the transaction success/failure status in your database

	// Example: Updating in-memory for demonstration purposes, replace with your database logic
	const transaction = transactionsDatabase[detail.client_ref_id];
	if (transaction) {
		transaction.status =
			detail.response.data.tx_status === "0" ? "success" : "failure";
		// Update other relevant details
	}

	// Return an acknowledgment response
	return {
		status: "success",
	};
}

// Function to generate request_hash
function generateRequestHash(detail) {
	const { secret_key_timestamp, request_hash_params, data } = detail;
	const concatenatedString = [
		secret_key_timestamp,
		...request_hash_params.map((param) => data[param]),
	].join("");
	const secretKey = "your_secret_key"; // Replace with your actual secret key

	const encodedKey = Buffer.from(secretKey, "utf-8").toString("base64");
	const hmac = crypto.createHmac("sha256", Buffer.from(encodedKey, "base64"));
	const signature = hmac.update(concatenatedString).digest("base64");

	return signature;
}

module.exports = {
	handleAePSCallback,
};
