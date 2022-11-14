/*
import { getFirestore } from 'firebase/firestore';
 * Note: Always end an HTTP function with send(),
 * redirect("/api/",(req, res) => {});, or end() to prevent
 * the function from running continuously until forcibly
 * terminated by the system
 */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const {Logging} = require("@google-cloud/logging");

const express = require("express");
const app = express();
const cors = require("cors")({origin: true});

const projectID = process.env.REACT_APP_FIREBASE_PROJECT_ID;


// Initialization
const logging = new Logging();
const log = logging.log("Initialization");

// Create data for Cloud Logging log
const METADATA = {
  resource: {
    type: "cloud_function",
    labels: {
      function_name: "App",
      region: "us-central1",
    },
  },
};
const messageData = {
  event: "Admin initialization",
  value: "App successfully initialized",
  message: "Admin initialization: App successfully initialized",
};

// Write log to Cloud Logging
const entry = log.entry(METADATA, messageData);
log.write(entry);

// Initialize App using Admin SDK
const fireApp = admin.initializeApp();
functions.logger.log(`Started => Project: ${projectID}, Name: ${fireApp.name}`);

// Create SDK references
const auth = admin.auth();
const firestore = admin.firestore();

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


/**
 * HTTP GET Requests
 *
 *
 */

/* Route that queries the database for a list of users
 *
 *
 */
app.get("/api/users", (req, res) => {});

/* Route that queries the database for a specific user
 *
 *
 */
app.get("/api/user/:user",(req, res) => {});

/* Route that queries the database for a specific user's specific planet
 *
 *
 */
app.get("/api/user/:user/:planet",(req, res) => {});

/* Route that queries the database for a list of planets for a specific user
 *
 *
 */
app.get("/api/user/:user/planets",(req, res) => {});


/**
 * HTTP POST Requests
 *
 *
 */

/* Route that processes user login request
 *
 *
 */
app.post("/api/login",(req, res) => {});

/* Route that processes user account signup
 *
 *
 */
app.post("/api/signup",(req, res) => {});

/* Route that processes user account updates
 *
 *
 */
app.post("/api/edit",(req, res) => {});

/* Route that processes user account logout
 *
 *
 */
app.post("/api/logout",(req, res) => {});

/* Route that queries the database for a query
 *
 *
 */
app.post("/api/search/:query",(req,res) => {});


exports.app = functions.https.onRequest(app);
