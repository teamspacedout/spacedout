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
  res.status(200).send({date: date.toISOString(), hours: hours, minutes: minutes}).json();
});


/** Firebase Authentication Endpoints
 */

/** Auth endpoint: Queries Firebase Auth for a list of users
 * @return: Returns an array of UserRecord Auth objects
 * Currently limits request to 100 users
 */
app.get("/api/auth/users", (req, res) => {
  const usersList = [];
  auth
      .listUsers(100)
      .then((listUsersResult) => {
        listUsersResult.users.forEach((userRecord) => {
          const strippedRecord = {
            uid: userRecord.uid,
            email: userRecord.email,
            emailVerified: userRecord.emailVerified,
            displayName: userRecord.displayName,
            photoUrl: userRecord.photoURL,
            metadata: userRecord.metadata,
            providerId: userRecord.providerData,
          };
          usersList.push(strippedRecord);
        });
        res.send(usersList);
      })
      .catch((error) => {
        res.status(400).send(error.code);
      });
});

/** Auth endpoint: Queries Firebase Auth for a specific user
 * @param req
 * @return { UserRecord } Returns an UserRecord Auth object
 */
app.get("/api/auth/user/:user", (req, res) => {
  const userId = req.params.user;
  auth.getUser(userId).then((userRecord) => {
    res.status(200).send(userRecord);
  }).catch((error) => {
    res.status(400).send(error.code);
  });
});

/** Auth endpoint: Updates Firebase Auth for a specific user
 * @return: Returns an UserRecord Auth object
 */
app.put("/api/auth/user/:user", (req, res) => {});

/** Auth endpoint: Deletes Firebase Auth for a specific user
 * @return: Returns an object containing success state
 */
app.delete("/api/auth/user/:user", (req, res) => {});

/** Auth endpoint: Processes user account signup
 * Creates a User with Firebase Authentication
 * using Email/Password form-data
 *
 * On successful user Auth creation, a User document
 * is created in Firestore and populated with the user's
 * data and default User document values
 *
 * @param req: { email, password, displayName }
 *
 * @return: Returns { displayName, uid, authToken }
 */
app.post("/api/auth/user/signup", (req, res) => {
  // Create User Auth object from request data
  const user = {
    email: req.body.email,
    emailVerified: false,
    password: req.body.password,
    displayName: req.body.displayName,
  };

  // Create user using Firebase Auth
  auth.createUser(user)
      .then((userRecord) => {
        // Create Auth Token for Client
        const uid = userRecord.uid;
        auth.createCustomToken(uid).then((data) => {
          const user = {
            displayName: userRecord.displayName,
            uid,
            authToken: data,
          };
          res.status(200).send(user);
        });
      })
      .catch((error) => {
        let errorResponse = {};
        switch (error.code) {
          case "auth/email-already-in-use":
            errorResponse = {error: "Email address is already in use"};
            break;

          case "auth/email-already-exists":
            errorResponse = {error: "Email address is already in use"};
            break;

          case "auth/invalid-email":
            errorResponse = {error: "Email address is invalid"};
            break;

          case "auth/operation-not-allowed":
            errorResponse = {error: "Sign up failed, operation not permitted"};
            break;

          case "auth/weak-password":
            errorResponse = {error: "Password is not strong enough"};
            break;

          default:
            errorResponse = {error: error.code};
        }
        res.status(500).send(errorResponse);
      });
});


/** Auth endpoint: Processes user login request
 * @param req: { email, password }
 * @return { authToken }
 */
app.post("/api/auth/user/login", (req, res) => {});

/** Auth endpoint: Processes user account logout
 * @param req: { authToken }
 * @return { statusMessage }
 */
app.post("/api/auth/user/logout", (req, res) => {});


/** Firebase Firestore Endpoints
 */

/** DB endpoint: Queries the database for a list of users
 */
app.get("/api/db/users", (req, res) => {
  const usersDocuments = [];
  firestore.collection("Users").get()
      .then((docs) => {
        docs.forEach((doc) => {
          usersDocuments.push(doc.data());
        });
        res.status(200).send(usersDocuments);
      }).catch((error) => {
        res.status(400).send(error);
      });
});

/** DB endpoint: Queries the database for a specific user
 */
app.get("/api/db/user/:user", (req, res) => {
  const userId = req.params.user;
  firestore.doc(`Users/${userId}`).get().then((userDoc) => {
    res.status(200).send(userDoc.data());
  }).catch((error) => {
    res.status(400).send({error: error.code});
  });
});

/** DB endpoint: Updates document for a specific user
 */
app.put("/api/db/user/:user", (req, res) => {});

/** DB endpoint: Deletes the document for a specific user
 */
app.delete("/api/db/user/:user", (req, res) => {});


/** DB endpoint: Queries the database for a list of planets
 */
app.get("/api/db/planets", (req, res) => {
  const planetsDocuments = [];
  firestore.collection("Planets").get()
      .then((docs) => {
        docs.forEach((doc) => {
          planetsDocuments.push(doc.data());
        });
        res.status(200).send(planetsDocuments);
      })
      .catch((error) => {
        res.status(400).send({Error: error.code});
      });
});

/** DB endpoint: Queries the database for a specific planet
 */
app.get("/api/db/planet/:planet", (req, res) => {});

/** DB endpoint: Updates document for a specific planet
 */
app.put("/api/db/planet/:planet", (req, res) => {});

/** DB endpoint: Deletes the document for a specific planet
 */
app.delete("/api/db/planet/:planet", (req, res) => {});

/** DB endpoint: Creates a new planet document
 * @param req:
 *  {
 *    uid,              (String)
 *    planetName,       (String)
 *    planetImage,      (OPTIONAL)
 *    planetTags,       (Array)
 *    zoneName,         (String)
 *    zoneDescription,  (String)
 *  }
 */
app.post("/api/db/createPlanet", (req, res) => {
  const uid = req.body.uid;
  const userRef = firestore.doc(`Users/${uid}`);
  const zoneName = req.body.zoneName;
  const zoneDescription = req.body.zoneDescription;
  const planetName = req.body.planetName;
  const planetTags = req.body.planetTags;
  let userPlanetCount = -1;
  let planets = {};
  userRef.get().then((data) => {
    userPlanetCount = data.data().Planet_count;
    planets = data.data().Planets;
  }).catch((error) => {
    res.send({Error: "User does not exist!"});
  });

  // Create Planet object for Planet Document
  const planet = {
    User_uid: uid,
    User_ref: userRef.path,
    Planet_name: planetName,
    Planet_image: "",
    Planet_tags: planetTags,
    Zone_count: 1,
    Zones_info: [
      {
        Zone_name: zoneName,
        Zone_description: zoneDescription,
      },
    ],
  };
  // Create Zone object for Zone Document
  const zone = {
    User_uid: planet.User_uid,
    Zone_name: req.body.zoneName,
    Zone_description: req.body.zoneDescription,
    ZoneContent_count: 0,
  };


  // Get User's Planet document
  const planetRef = firestore.collection("Planets").doc();
  const planetRefID = planetRef.id;
  planetRef.set(planet).then(() => {
    const zoneRef = planetRef.collection("Zones").doc();
    zoneRef.set(zone).then(() => {
      const planetCount = userPlanetCount + 1;

      const userPlanet = {
        Planet_id: planetRefID,
        Planet_ref: planetRef.path,
        Planet_name: planet.Planet_name,
        Planet_image: planet.Planet_image,
        Zone_count: planet.Zone_count,
      };
      planets[userPlanet.Planet_id] = userPlanet;

      const updatedUserData = {
        Planets: planets,
        Planet_count: planetCount,
      };

      userRef.update(updatedUserData)
          .then(() => {
            res.status(200).send({Planet: planet, Zone: zone, Status: "Created"});
          });
    });
  })
      .catch((error) => {
        res.status(500).send({error: error.code});
      });
});

/** DB endpoint: Queries the database for a list of
 * zones in the Zones Subcollection of a specific Planet
 * @param req: { planet } - The Document ID of the planet
 * @return Array - An array containing the Zones documents data
 */
app.get("/api/db/planet/:planet/Zones", (req, res) => {
  const planetZonesDocuments = [];
  const planetId = req.params.planet;
  firestore.collection(`Planets/${planetId}/Zones`).get()
      .then((docs) => {
        docs.forEach((doc) => {
          planetZonesDocuments.push(doc.data());
        });
        res.status(200).send(planetZonesDocuments);
      })
      .catch((error) => {
        res.status(500).send({Error: error.code});
      });
});


exports.app = functions.https.onRequest(app);
// Create User Document in Users Collection on creation of new user
exports.createUserDoc = functions.auth.user().onCreate((userRecord) => {
  const uid = userRecord.uid;

  // Create User document using User Auth data
  const usersRef = firestore.collection("Users");

  usersRef.doc(uid).set({
    uid: uid,
    Username: userRecord.displayName,
    Friend_count: 0,
    Friends: [],
    Planet_count: 0,
    Planets: {},
  })
      .then( (writeResult) => {
        // Return user data and auth token
        const userData = {
          uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          createdAt: writeResult.writeTime.toDate(),
        };
        return userData;
      }).catch((error) => {
        console.error({Error: error.code});
      });
});
