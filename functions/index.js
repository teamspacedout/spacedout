const functions = require("firebase-functions");
const admin = require("firebase-admin");

const express = require("express");
const app = express();
const cors = require("cors")({origin: true});

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

admin.initializeApp();

exports.addMessage = functions.https.onRequest(async (req, res) => {
	// Grab the parameter
	const original = req.query.text;

	const writeResult = await admin.firestore().collection('messages').add({original: original});

	const data = await admin.firestore().collection('messages').get().then(querySnapshot => {
		let docs = querySnapshot.docs;
		for (let doc of docs) {
			const item = {
				id: doc.id,
				data: doc.data().original
			};
			console.log(item);
		}
	});
	
	const allMessagesRef = await admin.firestore().collection('messages').get();
	
	let messages = [];
	const allMessages = allMessagesRef.docs;
	for (let entry of allMessages) {
		messages.push({id: entry.id, data: entry.data().original});
	}
	

	res.json(messages.map(message => `ID: ${message.id} \tData: ${message.data}\n`));
	
	//res.json(allMessages.map(doc => doc))
		
	//res.json({result: `Message with ID: ${writeResult.id} and Data: ${original}`});
});

app.use(cors);

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
