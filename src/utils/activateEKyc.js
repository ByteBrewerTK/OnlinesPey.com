const crypto = require("crypto");

exports.activateEKyc = ()=> {
	try {
		const key = "d2fe1d99-6298-4af2-8cc5-d97dcf46df30"; // uat auth key
		const secretKeyTimestamp = new Date().getTime().toString();

		const encodedKey = Buffer.from(key, "utf-8").toString("base64");

		const hmac = crypto.createHmac(
			"sha256",
			Buffer.from(encodedKey, "base64")
		);
		hmac.update(Buffer.from(secretKeyTimestamp, "utf-8"));

		const secretKey = hmac.digest("base64");

		const utilityAccNo = "831882579383";
		const amount = "100";
		const userCode = "34097002";
		const concatenatedString =
			secretKeyTimestamp + utilityAccNo + amount + userCode;

		const hash = crypto
			.createHmac("sha256", Buffer.from(secretKey, "base64"))
			.update(Buffer.from(concatenatedString, "utf-8"))
			.digest("base64");

        const payload = {
			secret_key: secretKey,
			secret_key_timestamp : secretKeyTimestamp
		};
		
        return payload;
	} catch (error) {
		console.error(error);
	}
}


