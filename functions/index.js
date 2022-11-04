/* Note: Always end an HTTP function with send(), redirect(), or end() to prevent
 * the function from running continuously until forcibly terminated by the system
 */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const { Logging } = require('@google-cloud/logging');
const express = require("express");

const app = express();
const cors = require("cors")({origin: true});

const projectID = process.env.REACT_APP_FIREBASE_PROJECT_ID;

// Initialization
admin.initializeApp();
const logging = new Logging();


/*
 * Example function:
 *
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
*
*/

app.use(cors);

app.get("/", (req, res) => {
	const date = new Date();
	const hours = date.getHours() % 12;
	const reload = () => window.location.reload(true);
	res.status(200).send(`
	<!DOCTYPE html>
	<html>
	  <head>
	    <title>Spaced Out API</title>
	  </head>

	  <body>
	    <p> The current time is ${date.toISOString()}</p>
	    <button onClick="window.location.reload(true)">Refresh</button>
	  </body>
	</html>
		`);
});


app.get("/api", (req, res) => {
	const date = new Date();
	const hours = date.getHours();
	const minutes = date.getMinutes();
	console.log(date.toString(), hours, minutes);
	res.status(200).send({ date: date.toISOString(), hours: hours, minutes: minutes}).json();
});


exports.app = functions.https.onRequest(app);
