// const BASE_URL = process.env.BASE_URL;

const BASE_URL = "http://localhost:4000/api/v1";

const form = document.querySelector("#auth-login");

console.log(form);

form.addEventListener("submit", async (event) => {
	event.preventDefault();

	const formData = new FormData(form);
	console.log(formData);
	// const turnstileToken = 

	const jsonData = {};
	for (let [key, value] of formData.entries()) {
		jsonData[key] = value;
	}
	console.log(jsonData);

	let jwtToken = "";
	await fetch(`${BASE_URL}/auth/login`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(jsonData),
	})
		.then((response) => response.json())
		.then((data) => {
			// Handle the response data
			console.log("fetching...");

			console.log(data);
			jwtToken = data.token;
			// const payload = JSON.parse(atob(token.split(".")[1]));
			// console.log(SON.parse(atob(data.token.split(".")[1])));
			console.log(jwtToken);
		})
		.catch((error) => {
			// Handle any errors that occurred during the request
			console.error(error);
		});

});

// fetch(`${BASE_URL}/auth/login`, {
// 	method: "POST",
// 	headers: {
// 		"Content-Type": "application/json",
// 	},
// 	body: JSON.stringify({
// 		phone: "123456",
// 		password: "1234",
// 	}),
// })
// 	.then((response) => response.json())
// 	.then((data) => {
// 		// Handle the response data
// 		console.log(data);
// 	})
// 	.catch((error) => {
// 		// Handle any errors that occurred during the request
// 		console.error(error);
// 	});
