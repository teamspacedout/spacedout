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
 * @return: Array - An array containing the UserRecord Auth objects
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
 * @param req.params: { user: The auth uid of the user }
 * @return Map - An object containing the UserRecord Auth data
 */
app.get("/api/auth/user/:user", (req, res) => {
  const userId = req.params.user.trim();
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
 * @param req.params: { user: The auth uid of the user }
 * @param req.body: The data to update the auth record with
 * req.body can update the following properties:
 * {email, phoneNumber, emailVerified, password, displayName, photoUrl, disabled}
 * @return: Map - An object containing success state and updated user data }
 */
app.put("/api/auth/user/:user", (req, res) => {
  const uid = req.params.user.trim();
  const updatedAuth = {
    email: req.body.email ? req.body.email.trim() : undefined,
    phoneNumber: req.body.phoneNumber ? req.body.phoneNumber.trim() : undefined,
    emailVerified: req.body.emailVerified ? req.body.emailVerified.trim() : undefined,
    password: req.body.password ? req.body.password.trim() : undefined,
    displayName: req.body.displayName ? req.body.displayName.trim() : undefined,
    photoURL: req.body.photoURL ? req.body.photoURL.trim() : undefined,
    disabled: req.body.disabled ? req.body.disabled.trim() : undefined,
  };

  // Check if data is undefined
  let isDataEmpty = true;

  for (const key in updatedAuth) {
    if (updatedAuth[key] !== undefined || updatedAuth[key] !== "") {
      isDataEmpty = false;
    } else {
      delete updatedAuth[key];
    }
  }


  if (isDataEmpty) {
    return res.status(500).send({Error: "No valid data was sent!"});
  } else {
    return auth.getUser(uid).then((userRecord) => {
      const username = userRecord.displayName;

      // Check if username is being updated
      if (updatedAuth.displayName && updatedAuth.displayName !== username) {
        const newUsername = updatedAuth.displayName;
        const oldUsername = userRecord.displayName;
        const usersRef = firestore.collection("Users");

        // Check if new displayName is not taken
        const usernameRef = usersRef.where("Username", "==", newUsername).limit(1);
        return usernameRef.get()
            .then((userDoc) => {
              if (userDoc.docs.length > 0) {
                updatedAuth.displayName = oldUsername;
                return {Error: `Username ${newUsername} is already taken.`};
              } else {
                // Username is not taken. Update both Users doc
                return usersRef.doc(uid).update({
                  Username: newUsername,
                }).then((userWriteResult) => {
                  // Update Planets subcollection
                  const planetsRef = firestore.collection(`Users/${uid}/Planets`);
                  return planetsRef.get().then((planetsDocs)=>{
                    return Promise.all(planetsDocs.docs.map((planetDoc) => {
                      return planetDoc.ref.update({Username: newUsername})
                          .then((writeResult) => {
                            const data = {
                              updatedAt: writeResult.writeTime.toDate(),
                              Planet_name: planetDoc.data().Planet_name,
                            };
                            return data;
                          });
                    }));
                  }).then((records) => {
                    const userRecord = {
                      New_Username: updatedAuth.displayName,
                      Old_Username: oldUsername,
                      userWriteResult: userWriteResult.writeTime.toDate(),
                    };
                    const writeResults = {
                      userRecord,
                      planetsRecord: records,
                    };
                    return writeResults;
                  });
                }).then((usernameWriteResult) => {
                  const writeTime = {
                    userWriteResult: usernameWriteResult.userRecord,
                    planetsWriteResult: usernameWriteResult.planetsRecord,
                  };
                  return writeTime;
                });
              }
            }).then((userUpdateData) => {
              if (userUpdateData.Error) {
                return res.status(500).send({userUpdateData});
              }
              // Update user record
              return auth.updateUser(uid, updatedAuth).then((updatedUserRecord) => {
                const result = {
                  Status: "Successful",
                  updatedUserRecord: {
                    uid: updatedUserRecord.uid,
                    email: updatedUserRecord.email,
                    phoneNumber: updatedUserRecord.phoneNumber,
                    emailVerified: updatedUserRecord.emailVerified,
                    displayName: updatedUserRecord.displayName,
                    photoURL: updatedUserRecord.photoURL,
                    disabled: updatedUserRecord.disabled,
                  },
                };
                return res.status(200).send({result, userUpdateData});
              });
            });
      } else {
        const removedUsername = {displayName: undefined};
        const strippedAuth = Object.assign({}, updatedAuth, removedUsername);
        if (Object.values(strippedAuth).every((val) => val === undefined)) {
          const result = {
            Status: "Unchanged",
            Completion_time: admin.firestore.Timestamp.now().toDate(),
            requestData: updatedAuth,
            UserRecord: {
              uid: userRecord.uid,
              email: userRecord.email,
              phoneNumber: userRecord.phoneNumber,
              emailVerified: userRecord.emailVerified,
              displayName: userRecord.displayName,
              photoURL: userRecord.photoURL,
              disabled: userRecord.disabled,
            },
          };
          console.dir({result}, {depth: null});
          return res.status(200).send({result});
        } else {
          return auth.updateUser(uid, updatedAuth).then((updatedUserRecord) => {
            const result = {
              Status: "Successful",
              Completion_time: admin.firestore.Timestamp.now().toDate(),
              requestData: updatedAuth,
              updatedUserRecord: {
                uid: updatedUserRecord.uid,
                email: updatedUserRecord.email,
                phoneNumber: updatedUserRecord.phoneNumber,
                emailVerified: updatedUserRecord.emailVerified,
                displayName: updatedUserRecord.displayName,
                photoURL: updatedUserRecord.photoURL,
                disabled: updatedUserRecord.disabled,
              },
            };
            console.dir({result}, {depth: null});
            return res.status(200).send({result});
          });
        }
      }
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
  }
});

/** Auth endpoint: Deletes Firebase Auth for a specific user
 * Additionally deletes the user's User document and Username
 * documents recursively
 * @param req.params: { user: The auth uid of the user }
 * @return: Map - An object containing success state and deleted user data
 */
app.delete("/api/auth/user/:user", (req, res) => {
  const uid = req.params.user.trim();

  // Validate if user exists
  return auth.getUser(uid).then((userRecord) => {
    if (userRecord.uid && userRecord.uid === uid) {
      const username = userRecord.displayName;

      auth.deleteUser(uid).then(() => {
        const responseMessage = {
          uid,
          username,
          Status: "Deleted successfully",
          deletedAt: admin.firestore.Timestamp.now().toDate(),
        };
        return res.status(200).send(responseMessage);
      });
    }
  }).catch((error) => {
    const errorMessage = `No user with uid: ${uid} was found`;
    console.dir({error}, {depth: null});
    return res.status(500).send({Error: errorMessage});
  });
});

/** Auth endpoint: Processes user account signup
 * Creates a User with Firebase Authentication
 * using Email/Password form-data
 *
 * On successful user Auth creation, a User and Username document
 * are created in Firestore and populated with the user's
 * data and respective default document values
 *
 * @param req.body: { email, password, displayName }
 * @return: Map - { displayName, uid, authToken }
 */
app.post("/api/auth/user/signup", (req, res) => {
  // Create User Auth object from request data
  const user = {
    email: req.body.email ? req.body.email.trim() : undefined,
    emailVerified: false,
    password: req.body.password ? req.body.password.trim() : undefined,
    displayName: req.body.displayName ? req.body.displayName.trim() : undefined,
  };

  let isDataInvalid = false;
  const errorMessage = {};

  for (const key in user) {
    if (user[key] === undefined || user[key] === "") {
      isDataInvalid = true;
      errorMessage[key] = "Invalid or missing value.";
    }
  }

  if (isDataInvalid) {
    return res.status(500).send({Error: errorMessage});
  } else {
    // Create user using Firebase Auth
    return auth.createUser(user)
        .then((userRecord) => {
        // Create Auth Token for Client
          const uid = userRecord.uid;
          return auth.createCustomToken(uid).then((data) => {
            const user = {
              displayName: userRecord.displayName,
              uid,
              authToken: data,
            };
            return res.status(200).send(user);
          });
        })
        .catch((error) => {
          let errorResponse = {};
          switch (error.code) {
            case "auth/email-already-in-use":
              errorResponse = {Error: "Email address is already in use"};
              break;

            case "auth/email-already-exists":
              errorResponse = {Error: "Email address is already in use"};
              break;

            case "auth/invalid-email":
              errorResponse = {Error: "Email address is invalid"};
              break;

            case "auth/operation-not-allowed":
              errorResponse = {Error: "Signup failed, operation not permitted"};
              break;

            case "auth/weak-password":
              errorResponse = {Error: "Password is not strong enough"};
              break;

            case "auth/invalid-password":
              errorResponse = {Error: "Password is invalid or missing"};
              break;

            default:
              errorResponse = {Error: error.code};
          }
          return res.status(500).send(errorResponse);
        });
  }
});


/** Firebase Firestore Endpoints
 */


/** Firestore Users Collection Endpoints
 */


/** DB endpoint: Queries the database for a list of users
 * @return: Array - An array containing the Users documents data
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
        res.status(400).send({Error: error.code});
      });
});

/** DB endpoint: Queries the database for a specific user
 * @param req.params: { username }
 * @return Map - An object containing the User document data
 */
app.get("/api/db/user/:username", (req, res) => {
  const userId = req.params.username.trim();
  firestore.doc(`Users/${userId}`).get().then((userDoc) => {
    res.status(200).send(userDoc.data());
  }).catch((error) => {
    res.status(400).send({error: error.code});
  });
});

/** DB endpoint: Updates the document for a specific user
 * @param req.params: { username }
 * @param req.body:
 * {
 *      profileData,         (Map)
 *      profileSettings,     (Map)
 * }
 * @return Map - An object containing the updated User document data
 */
app.put("/api/db/user/:username", (req, res) => {});


/** Firestore Planets Subcollection Endpoints
 */


/** DB endpoint: Queries the database for a list of planets
 * under a specific user
 * @param req.params: { username }
 * @return Array - An array containing the Planets documents data
 */
app.get("/api/db/user/:username/planets", (req, res) => {
  const username = req.params.username.trim();
  const usersRef = firestore.collection("Users");
  const userDoc = usersRef.where("Username", "==", username).limit(1);
  const planetsDocuments = [];
  let uid = "";

  return userDoc.get().then((userDocument) => {
    if (userDocument.docs.length > 0) {
      uid = userDocument.docs[0].data().uid;
    } else {
      uid = "invalid";
    }
    return uid;
  }).then((foundUid) => {
    return firestore.collection(`Users/${foundUid}/Planets`).get()
        .then((docs) => {
          docs.forEach((doc) => {
            const data = {
              Creation_time: doc.data().Creation_time.toDate(),
              uid: doc.data().uid,
              Zone_count: doc.data().Zone_count,
              Username: doc.data().Username,
              Planet_name: doc.data().Planet_name,
              Planet_description: doc.data().Planet_description,
              Planet_settings: doc.data().Planet_settings,
              Tags: doc.data().Tags,
              Planet_image: doc.data().Planet_image,
              Zones: doc.data().Zones,
            };
            planetsDocuments.push(data);
          });
          return res.status(200).send(planetsDocuments);
        });
  }).catch((error) => {
    return res.status(400).send({Error: error.code});
  });
});

/** DB endpoint: Queries the database for a specific planet
 * under a specific user
 * @param req.params: { username, planet }
 * @return Map - An object containing the Planet document data
 */
app.get("/api/db/user/:username/:planet", (req, res) => {
  const username = req.params.username.trim();
  const planetName = req.params.planet.trim();
  const usersRef = firestore.collection("Users");
  const userDoc = usersRef.where("Username", "==", username).limit(1);
  let uid = "";

  return userDoc.get().then((userDocument) => {
    if (userDocument.docs.length > 0) {
      uid = userDocument.docs[0].data().uid;
    } else {
      uid = "invalid";
    }
    return uid;
  }).then((foundUid) => {
    const collectionPath = `Users/${foundUid}/Planets`;
    return firestore.collection(collectionPath).doc(planetName).get()
        .then((doc) => {
          if (doc.exists) {
            const data = {
              Creation_time: doc.data().Creation_time.toDate(),
              uid: doc.data().uid,
              Username: doc.data().Username,
              Planet_name: doc.data().Planet_name,
              Planet_description: doc.data().Planet_description,
              Planet_image: doc.data().Planet_image,
              Planet_settings: doc.data().Planet_settings,
              Tags: doc.data().Tags,
              Zone_count: doc.data().Zone_count,
              Zones: doc.data().Zones,
            };
            console.dir({data}, {depth: null});
            return res.status(200).send(data);
          } else {
            return res.status(500).send({Error: `Planet ${planetName} not found.`});
          }
        });
  }).catch((error)=>{
    console.dir({Error: error.code}, {depth: null});
    return res.status(400).send({Error: error.code});
  });
});

/** DB endpoint: Updates the document for a specific planet
 * under a specific user
 * @param req.params: { username, planet }
 * @param req.body:
 * {
 *      planetDescription,
 *      planetImage,
 *      planetSettings,
 *      tags,
 * }
 * @return Map - An object containing the Planet document data
 */
app.put("/api/db/user/:username/:planet", (req, res) => {
  const username = req.params.username.trim();
  const planetName = req.params.planet.trim();
  const usersRef = firestore.collection("Users");
  const userDoc = usersRef.where("Username", "==", username).limit(1);
  let uid = "";

  const updatedData = {
    Planet_description: req.body.planetDescription ? req.body.planetDescription.trim() : undefined,
    Planet_image: req.body.planetImage ? req.body.planetImage.trim() : undefined,
    Planet_settings: req.body.planetSettings ? req.body.planetSettings : undefined,
    Tags: req.body.tags ? req.body.tags : undefined,
  };

  // Check if data is undefined
  let isDataEmpty = true;

  for (const key in updatedData) {
    if (updatedData[key] !== undefined || updatedData[key] !== "") {
      isDataEmpty = false;
    } else {
      delete updatedData[key];
    }
  }

  if (!isDataEmpty) {
    return userDoc.get().then((userDocument) => {
      if (userDocument.docs.length > 0) {
        uid = userDocument.docs[0].data().uid;
      } else {
        uid = "invalid";
      }
      return uid;
    }).then((foundUid) => {
      const collectionPath = `Users/${foundUid}/Planets`;
      // Update Planets document
      return firestore.collection(collectionPath).doc(planetName).get()
          .then((planetDoc) => {
            if (planetDoc.exists) {
              const data = {
                Planet_description: planetDoc.data().Planet_description,
                Planet_image: planetDoc.data().Planet_image,
                Planet_settings: planetDoc.data().Planet_settings,
                Tags: planetDoc.data().Tags,
              };

              const updatedFields = {};

              // Filter out unchanged values
              for (const key in data) {
                if (updatedData[key] && data[key] !== updatedData[key]) {
                  updatedFields[key] = updatedData[key];
                }
              }

              return planetDoc.ref.update(updatedFields).then((writeResult) => {
                const logPlanetUpdate = {
                  UpdatedAt: writeResult.writeTime.toDate(),
                  Username: username,
                  Request: updatedData,
                  UpdatedFields: updatedFields,
                  Data: data,
                };
                return logPlanetUpdate;
              }).then((logPlanetUpdate) => {
                // Update User document if relevant fields changed value
                const userPlanetData = logPlanetUpdate.UpdatedFields;

                // Filter out unchanged values
                const updatedUserFields = {
                  Planet_description: userPlanetData.Planet_description,
                  Planet_image: userPlanetData.Planet_image,
                };

                // Strip out undefined fields
                for (const key in updatedUserFields) {
                  if (updatedFields[key] === undefined) {
                    delete updatedUserFields[key];
                  }
                }

                const userDocUpdate = {};
                userDocUpdate.Planets = {};
                userDocUpdate.Planets[`${planetName}`] = updatedUserFields;

                if (updatedUserFields) {
                  const userDocPath = `Users/${foundUid}`;
                  return firestore.doc(userDocPath).update(userDocUpdate).then((userWriteResult) => {
                    const logUserUpdate = {
                      UpdatedAt: userWriteResult.writeTime.toDate(),
                      Username: username,
                      uid: foundUid,
                      UpdatedFields: updatedUserFields,
                    };
                    const logUpdates = {
                      logPlanetUpdate,
                      logUserUpdate,
                    };
                    console.dir({logUpdates}, {depth: null});
                    return res.status(200).send(logUpdates);
                  });
                } else {
                  console.dir({logPlanetUpdate}, {depth: null});
                  return res.status(200).send(logPlanetUpdate);
                }
              });
            } else {
              return res.status(500).send({Error: `Planet ${planetName} not found.`});
            }
          });
    }).catch((error)=>{
      console.dir({Error: error.code}, {depth: null});
      return res.status(500).send({Error: error.code});
    });
  } else {
    return res.status(500).send({Error: "Invalid data sent in request"});
  }
});

/** DB endpoint: Deletes the document for a specific planet
 * under a specific user
 * @param req.params: { username, planet }
 * @return Map - An object containing the Planet document data
 */
app.delete("/api/db/user/:username/:planet", (req, res) => {});

/** DB endpoint: Creates a new planet document under a specific user
 * @param req.params { username }
 * @param req.body:
 *  {
 *    planetName,                 (String)
 *    planetDescription,          (String) [OPTIONAL]
 *    planetImage,                (String) [OPTIONAL]
 *    planetTags,                 (Array)  [OPTIONAL]
 *  }
 * @return res:
 * {
 *    Status,                     (String)
 *    uid,                        (String)
 *    username,                   (String)
 *    User_UpdatedAt,             (String)
 *    doc_id,                     (String)
 *    Planet_doc
 *    {
 *        Creation_time,          (String)
 *        uid,                    (String)
 *        Username                (String)
 *        Planet_name,            (String)
 *        Planet_description,     (String)
 *        Planet_image,           (String)
 *        Planet_settings,        (Map)
 *        Tags,                   (Array)
 *        Zone_count,             (Integer)
 *        Zones,                  (Map)
 *    },
 * }
 */
app.post("/api/db/user/:username/createPlanet", (req, res) => {
  console.dir({Request: req.body}, {depth: null});

  const username = req.params.username.trim();
  const planetName = req.body.planetName.trim();
  const planetDescription = req.body.planetDescription.trim();
  const planetImage = req.body.planetImage.trim();
  const planetTags = req.body.planetTags;

  const usersRef = firestore.collection("Users");
  const userDoc = usersRef.where("Username", "==", username).limit(1);
  let uid = "";

  // Validate User is in the Users collection
  return userDoc.get().then((userDocument) => {
    if (userDocument.docs.length > 0) {
      uid = userDocument.docs[0].data().uid;
    } else {
      uid = "invalid";
    }

    return uid;
  }).then((foundUid) => {
    if (foundUid === "invalid") {
      return foundUid;
    } else {
    // Validate and create planet
      const userRef = firestore.doc(`Users/${uid}`);

      let userPlanetCount = -1;
      let planets = {};

      // Get user document data
      return userRef.get().then((userDoc) => {
        userPlanetCount = userDoc.data().Planet_count;
        planets = userDoc.data().Planets;

        let validPlanetName = planetName;

        // Get User's Planet subcollection
        const planetsRef = userRef.collection("Planets");

        // Validate unique planet name
        if (planets[validPlanetName]) {
          const newName = String(Math.floor(Math.random() * 99999));
          validPlanetName = validPlanetName + "_" + newName;
        }

        // Create Planet object for Planet Document
        const newPlanet = {
          Creation_time: admin.firestore.Timestamp.now().toDate(),
          uid: uid,
          Username: username,
          Planet_name: validPlanetName,
          Planet_description: planetDescription,
          Planet_image: "",
          Planet_settings: {},
          Tags: planetTags,
          Zone_count: 0,
          Zones: {},
        };

        // Set planet
        return planetsRef.doc(validPlanetName).set(newPlanet)
            .then((writeTime) => {
              const planetCount = userPlanetCount + 1;

              const userPlanet = {
                Planet_name: newPlanet.Planet_name,
                Planet_description: newPlanet.Planet_description,
                Planet_image: newPlanet.Planet_image,
                Zone_count: newPlanet.Zone_count,
              };
              planets[userPlanet.Planet_name] = userPlanet;

              const updatedUserData = {
                Planets: planets,
                Planet_count: planetCount,
              };

              return userRef.update(updatedUserData)
                  .then((updateWriteResult) => {
                    const Response = {
                      Status: "Created",
                      uid,
                      Username: username,
                      User_updatedAt: updateWriteResult.writeTime.toDate(),
                      doc_id: planetName,
                      Planet_doc: newPlanet,
                    };
                    console.dir({Response}, {depth: null});
                    return res.status(200).send({Response});
                  });
            });
      });
    }
  }).catch((error) => {
    console.dir({Error: error.code}, {depth: null});
    return res.status(500).send({error: error.code});
  });
});


/** Firestore Zones Subcollection Endpoints
 */


/** DB endpoint: Queries the database for a list of zones
 * under a specific planet under a specific user
 * @param req: { username, planet }
 * @return Array - An array containing the Zones documents data
 */
app.get("/api/db/user/:username/:planet/zones", (req, res) => {});

/** DB endpoint: Queries the database for a specific zone
 * under a specific planet under a specific user
 * @param req.params: { username, planet, zone }
 * @return Map - An object containing the Zone document data
 */
app.get("/api/db/user/:username/:planet/:zone", (req, res) => {});

/** DB endpoint: Updates the document for a specific zone
 * under a specific planet under a specific user
 * @param req.params: { username, planet, zone }
 * @return Map - An object containing the Zone document data
 */
app.put("/api/db/user/:username/:planet/:zone", (req, res) => {});

/** DB endpoint: Deletes the document for a specific zone
 * under a specific planet under a specific user
 * @param req.params: { username, planet, zone }
 * @return Map - An object containing the Zone document data
 */
app.delete("/api/db/user/:username/:planet/:zone", (req, res) => {});

/** DB endpoint: Creates a new zone document under a specific planet
 * under a specific user
 * @param req:
 *  {
 *    username,                 (String)
 *    planet                    (String)
 *    zoneName,                 (String)
 *    zoneImage,                (String) [OPTIONAL]
 *    zoneDescription,          (String) [OPTIONAL]
 *    zoneTags,                 (Array)  [OPTIONAL]
 *  }
 * @return res:
 * {
 *    Username                  (String)
 *    Planet_name               (String)
 *    zone_doc
 *    {
 *        doc_id,               (String)
 *        Creation_time,        (String)
 *        Zone_name,            (String)
 *        Zone_image,           (String)
 *        Zone_description      (String)
 *        Zone_settings,        (Map)
 *        Tags,                 (Array)
 *        ZoneContent_count,    (Integer)
 *        ZoneContent,          (Map)
 *    },
 * }
 */
app.post("/api/db/user/:username/:planet/createZone", (req, res) => {});


/** Firestore ZoneContent Subcollection Endpoints
 */


/** DB endpoint: Queries the database for a list of zonecontents
 * under a specific zone under a specific planet under a specific user
 * @param req.params: { username, planet, zone }
 * @return Array - An array containing the ZoneContent documents data
 */
app.get("/api/db/user/:username/:planet/:zone/zonecontents", (req, res) => {});

/** DB endpoint: Queries the database for a specific zonecontent
  * under a specific zone under a specific planet under a specific user
  * @param req.params: { username, planet, zone, zonecontent }
  * @return Map - An object containing the ZoneContent document data
  */
app.get("/api/db/user/:username/:planet/:zone/:zonecontent", (req, res) => {});

/** DB endpoint: Updates the document for a specific zonecontent
  * under a specific zone under a specific planet under a specific user
  * @param req.params: { username, planet, zone, zonecontent }
  * @return Map - An object containing the ZoneContent document data
  */
app.put("/api/db/user/:username/:planet/:zone/:zonecontent", (req, res) => {});

/** DB endpoint: Deletes the document for a specific zonecontent
  * under a specific zone under a specific planet under a specific user
  * @param req.params: { username, planet, zone, zonecontent }
  * @return Map - An object containing the ZoneContent document data
  */
app.delete("/api/db/user/:username/:planet/:zone/:zonecontent", (req, res) => {});

/** DB endpoint: Creates a new zonecontent document under a specific zone
  * under a specific planet under a specific user
  * @param req:
  * {
  *   username,                     (String)
  *   planet                        (String)
  *   zone                          (String)
  *   contentName,                  (String)
  *   contentData,                  (Reference) [OPTIONAL]
  *   contentDescription,           (String) [OPTIONAL]
  *   contentTags,                  (Array)  [OPTIONAL]
     * }
  * @return res:
  * {
  *    Username                     (String)
  *    Planet_name                  (String)
  *    Zone_name                  (String)
  *    content_doc
  *    {
  *        doc_id,                  (String)
  *        Creation_time,           (String)
  *        Content_id,              (String)
  *        Content_name,            (String)
  *        Content_description      (String)
  *        Content_data             (Reference)
  *        Tags,                    (Array)
  *    },
  * }
  */
app.post("/api/db/user/:username/:planet/:zone/createContent", (req, res) => {});


/** Firestore Group Query Endpoints
 */


/** DB endpoint: Queries the Users collection,
 * the Planets, Zones, ZoneContent subcollections for a given query
 * Query will match the Tags document field
 * @param req.params: { query }
 * @return Array - An array containing the matching queried data
 */
app.get("/api/db/query/:query", () => {});


/**
 * Functions Exports
 */


exports.app = functions.https.onRequest(app);

// Creates User Document in Users Collection on creation of new user
exports.createUserDoc = functions.auth.user().onCreate((userRecord) => {
  const usersRef = firestore.collection("Users");

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
      console.dir({updatedRecord}, {depth: null});
    });
  }

  // Check for unique username
  const usernamesRef = usersRef.where("Username", "==", displayName);

  return usernamesRef.get().then((usernameDoc) => {
    if (usernameDoc.docs.length > 0) {
      // Set username to uid
      displayName = uid;
      return auth.updateUser(uid, {displayName: uid}).then((updatedUserRecord) => {
        return updatedUserRecord;
      });
    }
  }).then(() => {
    // Create Users document
    const userData = {
      uid: uid,
      Username: displayName,
      Friend_count: 0,
      Friends: [],
      Planet_count: 0,
      Planets: {},
      Profile_data: {
        Bio: defaultBio,
      },
      Profile_settings: {},
    };
    return usersRef.doc(uid).set(userData).then((writeResult) => {
      // Return user data
      const logUserData = {
        createdAt: writeResult.writeTime.toDate(),
        email: userRecord.email,
        userData,
      };
      console.dir({logUserData}, {depth: null});
      return ({logUserData});
    });
  }).catch((error) => {
    const errorMessage = {
      Status: "Failed user creation",
      Error: {
        Code: error.code,
        Message: error.message,
      },
    };
    console.dir({errorMessage}, {depth: null});
    return ({errorMessage});
  });
});

// Deletes User Document and Subcollections in Users Collection
// on deletion of existing user
exports.deleteUserDoc = functions.auth.user().onDelete((userRecord) => {
  const uid = userRecord.uid;
  const username = userRecord.displayName;
  const usersRef = firestore.collection("Users").doc(uid);

  // Delete user document and subcollections
  return firestore.recursiveDelete(usersRef).then(() => {
    return usersRef.delete().then((usersDeleteResult) => {
      const logUserDelete = {
        Status: "Successful user deletion",
        UsersRecord: usersDeleteResult.writeTime.toDate(),
        DeletedUser: {
          uid: uid,
          username: username,
        },
        DeletedAt: admin.firestore.Timestamp.now().toDate(),
      };
      console.dir({logUserDelete}, {depth: null});
      return ({logUserDelete});
    });
  }).catch((error) => {
    const errorMessage = {
      Status: "Failed user deletion",
      Error: {
        Code: error.code,
        Message: error.message,
      },
    };
    console.dir({errorMessage}, {depth: null});
    return ({errorMessage});
  });
});
