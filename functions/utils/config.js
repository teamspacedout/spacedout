const functions = require("firebase-functions");
const admin = require("firebase-admin");
// const {Logging} = require("@google-cloud/logging");

const adminApp = admin.initializeApp();

// Create SDK references
const auth = admin.auth();
const firestore = admin.firestore();

const express = require("express");
const app = express();
const cors = require("cors")({origin: true});

app.use(cors);


module.exports = { app, adminApp, admin, auth, firestore , functions };
