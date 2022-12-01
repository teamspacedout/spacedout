/**
 * Note: Always end an HTTP function with send(),
 * redirect("/api/",(req, res) => {});, or end() to prevent
 * the function from running continuously until forcibly
 * terminated by the system
 */

const utils = require("./utils/config");
const functions = utils.functions;
const admin = utils.admin;
const app = utils.app;
const auth = utils.auth;
const firestore = utils.firestore;


const authUser = require("./controllers/AuthUser");
const createUserAuth = authUser.createUser;
const getUserAuth = authUser.getUser;
const getUsersAuth = authUser.getUsers;
const updateUserAuth = authUser.updateUser;
const deleteUserAuth = authUser.deleteUser;



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
app.get("/api/auth/users", getUsersAuth);

/** Auth endpoint: Queries Firebase Auth for a specific user
 * @param req.params: { user: The auth uid of the user }
 * @return Map - An object containing the UserRecord Auth data
 */
app.get("/api/auth/user/:user", getUserAuth);

/** Auth endpoint: Updates Firebase Auth for a specific user
 * @param req.params: { user: The auth uid of the user }
 * @param req.body: The data to update the auth record with
 * req.body can update the following properties:
 * {email, phoneNumber, emailVerified, password, displayName, photoUrl, disabled}
 * @return: Map - An object containing success state and updated user data }
 */
app.put("/api/auth/user/:user", updateUserAuth);

/** Auth endpoint: Deletes Firebase Auth for a specific user
 * Additionally deletes the user's User document and Username
 * documents recursively
 * @param req.params: { user: The auth uid of the user }
 * @return: Map - An object containing success state and deleted user data
 */
app.delete("/api/auth/user/:user", deleteUserAuth);

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
app.post("/api/auth/user/signup", createUserAuth);


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
  const username = req.params.username.trim();

  firestore.collection("Users").where("Username", "==", username).limit(1)
      .get().then((userDoc) => {
        res.status(200).send(userDoc.docs[0].data());
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
app.put("/api/db/user/:username", (req, res) => {
  const username = req.params.username.trim();
  const usersRef = firestore.collection("Users");
  const userDoc = usersRef.where("Username", "==", username).limit(1);

  const updatedUser = {
    Profile_data: req.body.profileData ? req.body.profileData : undefined,
    Profile_settings: req.body.profileSettings ? req.body.profileSettings : undefined,
  };

  // Check if data is undefined
  let isDataEmpty = true;

  for (const key in updatedUser) {
    if (updatedUser[key] !== undefined && Object.values(updatedUser[key]).length > 0) {
      isDataEmpty = false;
    } else {
      delete updatedUser[key];
    }
  }

  if (!isDataEmpty) {
    return userDoc.get().then((userDocument) => {
      if (userDocument.docs.length > 0) {
        const docId = userDocument.docs[0].id;
        const userProfileData = userDocument.docs[0].data().Profile_data;
        const userProfileSettings = userDocument.docs[0].data().Profile_settings;
        const uid = userDocument.docs[0].data().uid;

        // Update User document
        return usersRef.doc(docId).update(updatedUser).then((writeResult) => {
          const originalData = {
            Profile_data: userProfileData,
            Profile_settings: userProfileSettings,
          };
          const logUserUpdate = {
            UpdatedAt: writeResult.writeTime.toDate(),
            Username: username,
            uid: uid,
            originalData,
            updatedFields: updatedUser,
          };
          return res.status(200).send(logUserUpdate);
        });
      } else {
        return res.status(500).send({Error: "User not found"});
      }
    }).catch((error) => {
      return res.status(500).send({Error: error.code});
    });
  } else {
    return res.status(400).send({Error: "No valid data was sent"});
  }
});


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
app.get("/api/db/user/:username/planet/:planet", (req, res) => {
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
    return firestore.collection(collectionPath).where("Planet_name", "==", planetName)
        .limit(1).get().then((doc) => {
          if (doc.docs[0].exists) {
            const data = {
              Creation_time: doc.docs[0].data().Creation_time.toDate(),
              uid: doc.docs[0].data().uid,
              Username: doc.docs[0].data().Username,
              Planet_name: doc.docs[0].data().Planet_name,
              Planet_description: doc.docs[0].data().Planet_description,
              Planet_image: doc.docs[0].data().Planet_image,
              Planet_settings: doc.docs[0].data().Planet_settings,
              Tags: doc.docs[0].data().Tags,
              Zone_count: doc.docs[0].data().Zone_count,
              Zones: doc.docs[0].data().Zones,
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
app.put("/api/db/user/:username/planet/:planet", (req, res) => {
  const username = req.params.username.trim();
  const planetName = req.params.planet.trim();
  const usersRef = firestore.collection("Users");
  const userDoc = usersRef.where("Username", "==", username).limit(1);
  let uid = "";

  const updatedData = {
    Planet_name: req.body.planetName ? req.body.planetName.trim() : undefined,
    Planet_description: req.body.planetDescription ? req.body.planetDescription.trim() : undefined,
    Planet_image: req.body.planetImage ? req.body.planetImage.trim() : undefined,
    Planet_settings: Object.keys(req.body.planetSettings).length > 1 ? req.body.planetSettings : undefined,
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

  let userPlanets = {};

  if (!isDataEmpty) {
    return userDoc.get().then((userDocument) => {
      if (userDocument.docs.length > 0) {
        uid = userDocument.docs[0].data().uid;
        userPlanets = userDocument.docs[0].data().Planets;
      } else {
        uid = "invalid";
      }
      return uid;
    }).then((foundUid) => {
      const collectionPath = `Users/${foundUid}/Planets`;
      // Update Planets document
      return firestore.collection(collectionPath)
          .where("Planet_name", "==", planetName).limit(1).get()
          .then((planetDoc) => {
            if (planetDoc.docs[0].exists) {
              const currentData = {
                Planet_name: planetDoc.docs[0].data().Planet_name,
                Planet_description: planetDoc.docs[0].data().Planet_description,
                Planet_image: planetDoc.docs[0].data().Planet_image,
                Planet_settings: planetDoc.docs[0].data().Planet_settings,
                Tags: planetDoc.docs[0].data().Tags,
              };

              const updatedFields = {};

              // Filter out unchanged values
              for (const key in currentData) {
                if (updatedData[key] && currentData[key] !== updatedData[key]) {
                  updatedFields[key] = updatedData[key];
                }
              }

              // Update Planets document
              return planetDoc.docs[0].ref.update(updatedFields)
                  .then((writeResult) => {
                    const logPlanetUpdate = {
                      UpdatedAt: writeResult.writeTime.toDate(),
                      Username: username,
                      Request: updatedData,
                      UpdatedFields: updatedFields,
                      CurrentData: currentData,
                    };
                    return logPlanetUpdate;
                  }).then((logPlanetUpdate) => {
                    // Update User document if relevant fields changed value
                    const userPlanetData = logPlanetUpdate.UpdatedFields;

                    // Filter out unchanged values
                    const updatedUserFields = {
                      Planet_name: userPlanetData.Planet_name,
                      Planet_description: userPlanetData.Planet_description,
                      Planet_image: userPlanetData.Planet_image,
                    };

                    // Strip out undefined fields
                    for (const key in updatedUserFields) {
                      if (updatedFields[key] === undefined) {
                        delete updatedUserFields[key];
                      }
                    }

                    // Update Planets object
                    const userDocUpdate = {};
                    userDocUpdate.Planets = Object.assign(userPlanets);

                    // Check if Planet name is being updated
                    const updatedPName = updatedUserFields.Planet_name;
                    const currentPName = currentData.Planet_name;
                    if (updatedPName && updatedPName !== currentPName) {
                      // Get old planet data
                      const planetCopy = Object.assign(currentData);

                      // Copy old data to new planet
                      for (const key in updatedUserFields) {
                        // Overwrite updated values
                        if (planetCopy[key] !== updatedUserFields[key]) {
                          planetCopy[key] = updatedUserFields[key];
                        }
                      }

                      // Remove unnecessary fields
                      for (const key in planetCopy) {
                        if (key === "Tags" || key === "Planet_settings") {
                          delete planetCopy[key];
                        }
                      }
                      // Copy zone count
                      const targetPlanet = userDocUpdate.Planets[planetName];
                      const zoneCount = targetPlanet.Zone_count;
                      planetCopy.Zone_count = zoneCount;

                      // Assign updated planet to Planets map
                      const updateTarget = userDocUpdate.Planets;
                      updateTarget[planetCopy.Planet_name] = planetCopy;

                      // Delete old planet from Planets map
                      for (const key in userDocUpdate.Planets) {
                        if (key === planetName) {
                          delete userDocUpdate.Planets[key];
                        }
                      }
                    } else {
                      // Update fields
                      for (const key in updatedUserFields) {
                        if (updatedFields[key]) {
                          const data = updatedUserFields[key];
                          userDocUpdate.Planets[planetName][key] = data;
                        }
                      }
                    }

                    if (updatedUserFields) {
                      const userDocPath = `Users/${foundUid}`;

                      return firestore.doc(userDocPath).update(userDocUpdate)
                          .then((userWriteResult) => {
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
app.delete("/api/db/user/:username/planet/:planet", (req, res) => {
  const username = req.params.username.trim();
  const planetName = req.params.planet.trim();
  const usersRef = firestore.collection("Users");
  const userDoc = usersRef.where("Username", "==", username).limit(1);
  let uid = "";
  const currentUserDocData = {};

  return userDoc.get().then((userDocument) => {
    if (userDocument.docs.length > 0) {
      uid = userDocument.docs[0].data().uid;
      Object.assign(currentUserDocData, userDocument.docs[0].data());
    } else {
      uid = "invalid";
    }
    console.log({currentUserDocData});
    return uid;
  }).then((foundUid) => {
    if (foundUid !== "invalid") {
      const collectionPath = `Users/${foundUid}/Planets`;
      const userDocPath = `Users/${foundUid}`;

      console.log(`Collection Path: ${collectionPath}`);

      // Get Planet document
      return firestore.collection(collectionPath)
          .where("Planet_name", "==", planetName)
          .limit(1).get().then((doc) => {
            if (doc.docs.length > 0 && doc.docs[0].exists) {
              // Store data before delete
              const data = {
                Creation_time: doc.docs[0].data().Creation_time.toDate(),
                uid: doc.docs[0].data().uid,
                Username: doc.docs[0].data().Username,
                Planet_name: doc.docs[0].data().Planet_name,
                Planet_description: doc.docs[0].data().Planet_description,
                Planet_image: doc.docs[0].data().Planet_image,
                Planet_settings: doc.docs[0].data().Planet_settings,
                Tags: doc.docs[0].data().Tags,
                Zone_count: doc.docs[0].data().Zone_count,
                Zones: doc.docs[0].data().Zones,
              };

              // Create User document update object
              const newUserData = {
                Planets: {},
                Planet_count: Number(currentUserDocData.Planet_count),
              };
              const currentPlanets = currentUserDocData.Planets;
              console.log("Before filter: ", {newUserData, currentPlanets});

              // Filter out planet to be deleted
              for (const key in currentPlanets) {
                if (key !== planetName) {
                  newUserData.Planets[key] = currentPlanets[key];
                } else {
                  newUserData.Planet_count -= 1;
                }
              }
              console.dir("After filter: ", {newUserData}, {depth: 2});

              // Recurively delete document and its subcollections
              return firestore.recursiveDelete(doc.docs[0].ref).then(() => {
                // Delete entry in Users document
                return firestore.doc(userDocPath).update(newUserData)
                    .then((writeResult) => {
                      const logPlanetDelete = {
                        DeletedAt: writeResult.writeTime.toDate(),
                        CollectionPath: collectionPath,
                        Planet: data,
                      };
                      const logUserUpdate = {
                        userDocPath,
                        currentUserDocData,
                        newUserData,
                      };
                      const logObject = {logPlanetDelete, logUserUpdate};
                      console.dir(logObject, {depth: null});
                      return res.status(200).send(logObject);
                    });
              });
            } else {
              const errorMessage = {Error: `Planet ${planetName} not found.`};
              return res.status(500).send(errorMessage);
            }
          });
    } else {
      return res.status(500).send({Error: `User ${username} not found.`});
    }
  }).catch((error)=>{
    console.dir({Error: error.code}, {depth: null});
    return res.status(400).send({Error: error.code, Message: error.message});
  });
});

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
        for (const planet of Object.keys(planets)) {
          if (planets[planet].Planet_name === validPlanetName) {
            const newName = String(Math.floor(Math.random() * 99999));
            validPlanetName = validPlanetName + "_" + newName;
          }
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
        return planetsRef.doc().set(newPlanet)
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
app.get("/api/db/user/:username/planet/:planet/zones", (req, res) => {});

/** DB endpoint: Queries the database for a specific zone
 * under a specific planet under a specific user
 * @param req.params: { username, planet, zone }
 * @return Map - An object containing the Zone document data
 */
app.get("/api/db/user/:username/planet/:planet/zone/:zone", (req, res) => {});

/** DB endpoint: Updates the document for a specific zone
 * under a specific planet under a specific user
 * @param req.params: { username, planet, zone }
 * @return Map - An object containing the Zone document data
 */
app.put("/api/db/user/:username/planet/:planet/zone/:zone", (req, res) => {});

/** DB endpoint: Deletes the document for a specific zone
 * under a specific planet under a specific user
 * @param req.params: { username, planet, zone }
 * @return Map - An object containing the Zone document data
 */
app.delete("/api/db/user/:username/planet/:planet/zone/:zone", (req, res) => {});

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
app.post("/api/db/user/:username/planet/:planet/createZone", (req, res) => {});


/** Firestore ZoneContent Subcollection Endpoints
 */


/** DB endpoint: Queries the database for a list of zonecontents
 * under a specific zone under a specific planet under a specific user
 * @param req.params: { username, planet, zone }
 * @return Array - An array containing the ZoneContent documents data
 */
app.get("/api/db/user/:username/planet/:planet/zone/:zone/zonecontents", (req, res) => {});

/** DB endpoint: Queries the database for a specific zonecontent
  * under a specific zone under a specific planet under a specific user
  * @param req.params: { username, planet, zone, zonecontent }
  * @return Map - An object containing the ZoneContent document data
  */
app.get("/api/db/user/:username/planet/:planet/zone/:zone/zonecontent/:zonecontent", (req, res) => {});

/** DB endpoint: Updates the document for a specific zonecontent
  * under a specific zone under a specific planet under a specific user
  * @param req.params: { username, planet, zone, zonecontent }
  * @return Map - An object containing the ZoneContent document data
  */
app.put("/api/db/user/:username/planet/:planet/zone/:zone/zonecontent/:zonecontent", (req, res) => {});

/** DB endpoint: Deletes the document for a specific zonecontent
  * under a specific zone under a specific planet under a specific user
  * @param req.params: { username, planet, zone, zonecontent }
  * @return Map - An object containing the ZoneContent document data
  */
app.delete("/api/db/user/:username/planet/:planet/zone/:zone/zonecontent/:zonecontent", (req, res) => {});

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
app.post("/api/db/user/:username/planet/:planet/zone/:zone/createContent", (req, res) => {});


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
