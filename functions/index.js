/**
 * Note: Always end an HTTP function with send(),
 * redirect("/api/",(req, res) => {});, or end() to prevent
 * the function from running continuously until forcibly
 * terminated by the system
 */
const functions = require("firebase-functions");
const admin = require("firebase-admin");
// const {Logging} = require("@google-cloud/logging");

const express = require("express");
const app = express();
const cors = require("cors")({origin: true});

const projectID = process.env.REACT_APP_FIREBASE_PROJECT_ID;


// Initialization
// const logging = new Logging();
// const log = logging.log("Initialization");

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
// const entry = log.entry(METADATA, messageData);
// log.write(entry);

// Initialize App using Admin SDK
const fireApp = admin.initializeApp();
// functions.logger.log(`Started => Project: ${projectID}, Name: ${fireApp.name}`);

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
          const providerIds = userRecord.providerData.map((provider) => {
            return provider.providerId;
          });
          const strippedRecord = {
            uid: userRecord.uid,
            email: userRecord.email,
            emailVerified: userRecord.emailVerified,
            displayName: userRecord.displayName,
            photoUrl: userRecord.photoURL,
            metadata: userRecord.metadata,
            providerId: providerIds,
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
 * @param req.params.user: {uid}
 * @return userRecord:  Returns an UserRecord Auth object
 */
app.get("/api/auth/user/:user", (req, res) => {
  const userId = req.params.user;
  auth.getUser(userId).then((userRecord) => {
    const providerIds = userRecord.providerData.map((provider) => {
      return provider.providerId;
    });
    const userData = {
      uid: userRecord.uid,
      email: userRecord.email,
      emailVerified: userRecord.emailVerified,
      displayName: userRecord.displayName,
      disabled: userRecord.disabled,
      metadata: userRecord.metadata,
      providerData: providerIds,
    };
    res.status(200).send(userData);
  }).catch((error) => {
    res.status(400).send(error.code);
  });
});

/** Auth endpoint: Updates Firebase Auth for a specific user
 * @param req: req.params.user: The auth uid of the user
 * @param req: req.body: The data to update the auth record with
 * req.body can update the following properties:
 * {email, phoneNumber, emailVerified, password, displayName, photoUrl, disabled}
 * @return: Returns { Status, updatedUserRecord }
 */
app.put("/api/auth/user/:user", (req, res) => {
  const uid = req.params.user;
  const updatedAuthData = {
    email: undefined || req.body.email,
    phoneNumber: undefined || req.body.phoneNumber,
    emailVerified: undefined || req.body.emailVerified,
    password: undefined || req.body.password,
    displayName: undefined || req.body.displayName,
    photoURL: undefined || req.body.photoURL,
    disabled: undefined || req.body.disabled,
  };

  // Check if data is undefined
  let isDataEmpty = true;

  for (const key in updatedAuthData) {
    if (updatedAuthData[key] !== undefined) {
      isDataEmpty = false;
    }
  }

  if (isDataEmpty) {
    res.status(500).send({Error: "No valid data was sent in this request"});
    return;
  }


  auth.getUser(uid).then((userRecord) => {
    if (updatedAuthData.displayName && updatedAuthData.displayName !== userRecord.displayName) {
      const newUsername = updatedAuthData.displayName;
      const oldUsername = userRecord.displayName;
      const usernameRef = firestore.collection("Usernames");
      // Check if new displayName is not taken
      usernameRef.doc(newUsername).get()
          .then((usernameDoc) => {
            if (usernameDoc.exists) {
              updatedAuthData.displayName = userRecord.displayName;
              res.status(500).send({Error: "Username is already taken."});
              return;
            } else {
              // Username is not taken. Update both Users and Usernames docs
              const userRef = firestore.collection("Users");
              userRef.doc(uid).update({
                Username: newUsername,
              }).then((userWriteResult) => {
                usernameRef.doc(updatedAuthData.displayName).set({
                  uid,
                  Username: updatedAuthData.displayName,
                }).then((usernameWriteResult) => {
                  usernameRef.doc(oldUsername).delete()
                      .finally((usernameDeleteResult) => {
                        const writeTime = {
                          userWriteResult: userWriteResult.writeTime.toDate(),
                          newUsernameWriteResult: usernameWriteResult.writeTime.toDate(),
                          oldUsernameDeleteResult: admin.firestore.Timestamp.now().toDate(),
                        };
                        console.log(writeTime);
                      });
                });
              });
            }
            return usernameDoc;
          });
    }

    for (const key in updatedAuthData) {
      if (updatedAuthData[key] === userRecord[key] && userRecord[key] !== undefined) {
        res.status(500).send({Error: `This ${key} is already set for this user`});
        return;
      }
    }
    // Update user record
    auth.updateUser(uid, updatedAuthData).then((updatedUserRecord) => {
      const result = {
        Status: "Successful",
        updatedUserRecord: {
          uid: undefined || updatedUserRecord.uid,
          email: undefined || updatedUserRecord.email,
          phoneNumber: undefined || updatedUserRecord.phoneNumber,
          emailVerified: undefined || updatedUserRecord.emailVerified,
          displayName: undefined || updatedUserRecord.displayName,
          photoURL: undefined || updatedUserRecord.photoURL,
          disabled: undefined || updatedUserRecord.disabled,
        },
      };
      res.status(200).send({result});
      return;
    }).catch((error) => {
      let errorResponse = {};

      switch (error.code) {
        case "auth/user-not-found":
          errorResponse = {Error: "No valid user was found"};
          break;
        case "auth/email-already-in-use":
          errorResponse = {Error: "Email address is already in use"};
          break;

        case "auth/email-already-exists":
          errorResponse = {Error: "Email address is already in use"};
          break;

        case "auth/invalid-email":
          errorResponse = {Error: "Email address is invalid"};
          break;

        case "auth/invalid-phone-number":
          errorResponse = {Error: "Phone number is invalid"};
          break;

        case "auth/operation-not-allowed":
          errorResponse = {Error: "Update failed, operation not permitted"};
          break;

        case "auth/weak-password":
          errorResponse = {Error: "Password is not strong enough"};
          break;

        default:
          errorResponse = {error: error.code};
      }
      res.status(500).send(errorResponse);
      return;
    });
  }).catch((error) => {
    let errorResponse = {};

    switch (error.code) {
      case "auth/user-not-found":
        errorResponse = {Error: "No valid user was found"};
        break;
      case "auth/email-already-in-use":
        errorResponse = {Error: "Email address is already in use"};
        break;

      case "auth/email-already-exists":
        errorResponse = {Error: "Email address is already in use"};
        break;

      case "auth/invalid-email":
        errorResponse = {Error: "Email address is invalid"};
        break;

      case "auth/invalid-phone-number":
        errorResponse = {Error: "Phone number is invalid"};
        break;

      case "auth/operation-not-allowed":
        errorResponse = {Error: "Update failed, operation not permitted"};
        break;

      case "auth/weak-password":
        errorResponse = {Error: "Password is not strong enough"};
        break;

      default:
        errorResponse = {error: error.code};
    }
    res.status(500).send(errorResponse);
    return;
  });
});

/** Auth endpoint: Deletes Firebase Auth for a specific user
 * Additionally deletes the user's User document and Username
 * documents recursively
 * @param req: req.params.user: The auth uid of the user
 * @return: Returns an object containing success state
 */
app.delete("/api/auth/user/:user", (req, res) => {
  const uid = req.params.user;

  // Validate if user exists
  auth.getUser(uid).then((userRecord) => {
    if (userRecord.uid && userRecord.uid === uid) {
      const username = userRecord.displayName;

      auth.deleteUser(uid).then(() => {
        const responseMessage = {
          uid,
          username,
          Status: "Deleted successfully",
          deletedAt: admin.firestore.Timestamp.now().toDate(),
        };
        res.status(200).send(responseMessage);
      });
    }
  }).catch((error) => {
    const errorMessage = `No user with uid: ${uid} was found`;
    res.status(500).send({Error: errorMessage});
  });
  return;
});

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


/** Firebase Firestore Endpoints
 */

/** Firestore Usernames Collection Endpoints
 */

/** DB endpoint: Queries the database for a list of users
 */
app.get("/api/db/usernames", (req, res) => {});

/** DB endpoint: Queries the database for a specific username
 */
app.get("/api/db/username/:username", (req, res) => {});


/** Firestore Users Collection Endpoints
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


/** Firestore Planets Subcollection Endpoints
 */


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


/** Firestore Zones Subcollection Endpoints
 */


/** Firestore ZoneContent Subcollection Endpoints
 */


exports.app = functions.https.onRequest(app);

// Creates User Document in Users Collection
// and Username Document in Usernames Collection on creation of new user
exports.createUserDoc = functions.auth.user().onCreate((userRecord) => {
  const usersRef = firestore.collection("Users");
  const usernamesRef = firestore.collection("Usernames");

  // Create User document using User Auth data
  const uid = userRecord.uid;
  let displayName = "";
  const defaultBio = "A new explorer!";

  // Validate displayName
  if (userRecord.displayName && userRecord.displayName.trim() !== "") {
    displayName = userRecord.displayName;
  } else {
    displayName = uid;
    // Update auth displayName
    auth.updateUser(uid, {displayName: displayName}).then((updatedRecord) => {
      console.log({updatedRecord});
    });
  }

  // Check for unique username
  usernamesRef.doc(displayName).get()
      .then((usernameDoc) => {
        if (usernameDoc.exists) {
          // Set username to uid
          displayName = uid;
        }
      }).then(() => {
        // Create Users document
        usersRef.doc(uid).set({
          uid: uid,
          Username: displayName,
          Friend_count: 0,
          Friends: [],
          Planet_count: 0,
          Profile_data: {
            Bio: defaultBio,
          },
          Profile_settings: {},
        })
            .then((writeResult) => {
              // Return user data and auth token
              const userData = {
                uid,
                email: userRecord.email,
                displayName: displayName,
                createdAt: writeResult.writeTime.toDate(),
              };
              // Create Usernames document
              usernamesRef.doc(displayName).set({
                uid: uid,
                Username: displayName,
              }).then((writeResult) => {
                const usernameData = {
                  uid,
                  Username: displayName,
                  createdAt: writeResult.writeTime.toDate(),
                };

                console.log({usernameData, userData});
                return ({usernameData, userData});
              });
            });
      })
      .catch((error) => {
        console.error({Error: error.code});
      });
});

exports.deleteUserDoc = functions.auth.user().onDelete((userRecord) => {
  const uid = userRecord.uid;
  const username = userRecord.displayName;
  const usersRef = firestore.collection("Users").doc(uid);
  const usernamesRef = firestore.collection("Usernames").doc(username);

  // Delete user and username documents
  firestore.recursiveDelete(usersRef).then(() => {
    firestore.recursiveDelete(usernamesRef).then(() => {
      usersRef.delete().then(() => {
        usernamesRef.delete().then(() => {
          const logMessage = {
            Status: "Successful user deletion",
            UsersRecord: "Deleted successfully",
            UsernamesRecord: "Deleted successfully",
            DeletedUser: {
              uid: uid,
              username: username,
            },
            DeletedAt: admin.firestore.Timestamp.now().toDate(),
          };
          console.log(logMessage);
          return;
        });
      });
    });
  }).catch((error) => {
    const errorMessage = {
      Status: "Failed user deletion",
      Error: {
        Code: error.code,
        Message: error.message,
      },
    };
    console.log(errorMessage);
    return;
  });
});
