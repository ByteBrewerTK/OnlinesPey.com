const crypto = require("crypto");

const HMAC_SHA256 = "sha256";

const activateEKyc = ()=> {
	try {
		let secretKey = "";
		let secretKeyTimestamp = "";
		let requestHash = "";

		// Initializing key
		const key = "d2fe1d99-6298-4af2-8cc5-d97dcf46df30"; // uat auth key
		const encodedKey = Buffer.from(key, "utf-8").toString("base64");

		// Get secretKeyTimestamp: current timestamp in milliseconds since UNIX epoch as STRING
		// Check out https://currentmillis.com to understand the timestamp format
		const date = new Date();
		secretKeyTimestamp = date.getTime().toString();

		// Computes the signature by hashing the salt with the encoded key
		const sha256HMAC = crypto.createHmac(
			HMAC_SHA256,
			Buffer.from(encodedKey, "base64")
		);

		// Encode it using base64 to get secret-key
		secretKey = sha256HMAC.update(secretKeyTimestamp).digest("base64");

		const utilityAccNo = "766851234";
		const amount = "100";
		const userCode = "32221002";
		const concatenatedString =
			secretKeyTimestamp + utilityAccNo + amount + userCode;
		const hash = crypto
			.createHmac(HMAC_SHA256, Buffer.from(secretKey, "base64"))
			.update(concatenatedString)
			.digest("base64");
		requestHash = hash;

		console.log("secret-key:", secretKey);
		console.log("secret-key-timestamp:", secretKeyTimestamp);
		console.log("request_hash:", requestHash);
	} catch (error) {
		console.error(error);
	}
}

activateEKyc();
