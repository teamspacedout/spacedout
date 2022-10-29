const functions = require("firebase-functions");
const express = require("express");
const app = express();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

app.get("/", (req, res) => {
	const date = new Date();
	const hours = date.getHours() % 12;
	res.send(`
	<!DOCTYPE html>
	<html>
	  <head>
	    <title>Spaced Out API</title>
	  </head>

	  <body>
	    <p> The current time is ${date.toISOString()}</p>
	    <button onClick="refresh(this)">Refresh</button>
	  </body>
	</html>
		`);
});


app.get("/api", (req, res) => {
	const date = new Date();
	const hours = date.getHours() % 12;
	res.json({ date: date, hours: hours});
});


exports.app = functions.https.onRequest(app);
