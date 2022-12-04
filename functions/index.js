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

const dbUser = require("./controllers/DBUser");
const getUserDB = dbUser.getUser;
const getUsersDB = dbUser.getUsers;
const updateUserDB = dbUser.updateUser;

const dbPlanet = require("./controllers/DBPlanet");
const createPlanetDB = dbPlanet.createPlanet;
const getPlanetDB = dbPlanet.getPlanet;
const getPlanetsDB = dbPlanet.getPlanets;
const updatePlanetDB = dbPlanet.updatePlanet;
const deletePlanetDB = dbPlanet.deletePlanet;



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
app.get("/api/db/users", getUsersDB);

/** DB endpoint: Queries the database for a specific user
 * @param req.params: { username }
 * @return Map - An object containing the User document data
 */
app.get("/api/db/user/:username", getUserDB);

/** DB endpoint: Updates the document for a specific user
 * @param req.params: { username }
 * @param req.body:
 * {
 *      profileData,         (Map)
 *      profileSettings,     (Map)
 * }
 * @return Map - An object containing the updated User document data
 */
app.put("/api/db/user/:username", updateUserDB);


/** Firestore Planets Subcollection Endpoints
 */


/** DB endpoint: Queries the database for a list of planets
 * under a specific user
 * @param req.params: { username }
 * @return Array - An array containing the Planets documents data
 */
app.get("/api/db/user/:username/planets", getPlanetsDB);

/** DB endpoint: Queries the database for a specific planet
 * under a specific user
 * @param req.params: { username, planet }
 * @return Map - An object containing the Planet document data
 */
app.get("/api/db/user/:username/planet/:planet", getPlanetDB);

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
app.put("/api/db/user/:username/planet/:planet", updatePlanetDB);

/** DB endpoint: Deletes the document for a specific planet
 * under a specific user
 * @param req.params: { username, planet }
 * @return Map - An object containing the Planet document data
 */
app.delete("/api/db/user/:username/planet/:planet", deletePlanetDB);

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
app.post("/api/db/user/:username/createPlanet", createPlanetDB);


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
 *    params: {username (String), planet (String) }
 *    body: {
 *      zoneName,                 (String)
 *      zoneImage,                (String)  [OPTIONAL]
 *      zoneDescription,          (String)  [OPTIONAL]
 *      zoneTags,                 (Array)   [OPTIONAL]
 *    }
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
 * res contains other user, planet, zone data
 */
app.post("/api/db/user/:username/planet/:planet/createZone", (req, res) => {
  console.dir({Request: req.body}, {depth: null});
  const username = req.params.username;
  const planetName = req.params.planet;
  const zoneData = {
    Username: username,
    Planet: planetName,
    ZoneName: req.body.zoneName ? req.body.zoneName.trim() : undefined,
    ZoneImage: req.body.zoneImage ? req.body.zoneImage.trim() : "",
    ZoneDescription: req.body.zoneDescription ? req.body.zoneDescription.trim() : "",
    ZoneTags: req.body.zoneTags && req.body.zoneTags.length > 0 ? req.body.zoneTags : [],
    ZoneOrder: req.body.zoneOrder ? Number(req.body.zoneOrder) : -1,
  };

  const usersRef = firestore.collection("Users");
  const userDoc = usersRef.where("Username", "==", username).limit(1);
  let uid = "";
  let planetID = "";

  // Validate input
  let isDataInvalid = false;
  const errorMessage = {};

  for (const key in zoneData) {
    if (zoneData[key] === undefined) {
      isDataInvalid = true;
      errorMessage[key] = "Invalid or missing value.";
    }
  }
  const userPlanetUpdate = {
    Planets: {},
  };

  if (isDataInvalid) {
    return res.status(500).send({Error: errorMessage});
  } else {
    // Validate Username
    return userDoc.get().then((userDocument) => {
      if (userDocument && userDocument.docs.length > 0) {
        uid = userDocument.docs[0].data().uid;
        userPlanetUpdate.Planets = userDocument.docs[0].data().Planets;
      } else {
        uid = "invalid";
      }
      const userData = { uid, doc: userDocument.docs[0] };
      return userData;
    }).then((userData) => {
      if (userData.uid === "invalid") {
        return res.status(500).send({Error: "User not found"});
      } else {

        // Get Planet's subcollection
        const planetPath = `Users/${uid}/Planets`;
        const planetsRef = firestore.collection(planetPath);
        const planetDoc = planetsRef.where("Planet_name", "==", planetName).limit(1);

        // Validate Planet
        return planetDoc.get().then((planetDocument) => {
          if (planetDocument && planetDocument.docs.length > 0) {
            planetID = planetDocument.docs[0].id;
            const planetRef = planetDocument.docs[0].ref;
            let zoneCount = -1;
            let zones = {}
            const zoneOrder = Number(planetDocument.docs[0].data().Zone_count + 1);

            // Get planet document data
            const currentPlanetData = {
            Creation_time: planetDocument.docs[0].data().Creation_time.toDate(),
            uid: planetDocument.docs[0].data().uid,
            Username: planetDocument.docs[0].data().Username,
            Planet_name: planetDocument.docs[0].data().Planet_name,
            Planet_description: planetDocument.docs[0].data().Planet_description,
            Planet_settings: planetDocument.docs[0].data().Planet_settings,
            Tags: planetDocument.docs[0].data().Tags,
            Planet_image: planetDocument.docs[0].data().Planet_image,
            Zone_count: planetDocument.docs[0].data().Zone_count,
            Zones: planetDocument.docs[0].data().Zones,
            }

            let validZoneName = zoneData.ZoneName;

            zones = currentPlanetData.Zones;
            zoneCount = currentPlanetData.Zone_count;
            // Validate unique zone name
            for (const zone of Object.keys(zones)) {
              if (zones[zone].Zone_name === validZoneName) {
                  const newName = String(Math.floor(Math.random() * 99999));
                  validZoneName = validZoneName + "_" + newName;
              }
            }

            // Create updated Planet Object for Planet Document
            zones[validZoneName] = {
                Zone_name: validZoneName,
                Zone_order: zoneOrder,
                Zone_description: zoneData.ZoneDescription,
            }
            const updatedPlanet = {
              Zone_count: zoneCount + 1,
              Zones: zones,
            }

            // Create Zone object for Zone Document
            const newZone = {
              Creation_time: admin.firestore.Timestamp.now().toDate(),
              Zone_name: validZoneName,
              Zone_image: zoneData.ZoneImage,
              Zone_description: zoneData.ZoneDescription,
              Zone_settings: {},
              Tags: zoneData.ZoneTags,
              ZoneContent_count: 0,
              ZoneContent: {},
            };

            // Set Zone data in Planet Document
            return planetDocument.docs[0].ref.update(updatedPlanet).then((writeResult) => {
              const logPlanetUpdate = {
                UpdatedAt: writeResult.writeTime.toDate(),
                Username: username,
                PlanetName: planetName,
                Request: zoneData,
                CurrentData: currentPlanetData,
                UpdatedFields: updatedPlanet,
              }
              return logPlanetUpdate;
            }).then((logPlanetUpdate) => {
              // Set zone
              return planetRef.collection("Zones").doc().set(newZone).then((writeResult) => {
                const Response = {
                  Status: "Created!",
                  uid: uid,
                  Username: username,
                  PlanetName: planetName,
                  Planet_ID: planetID,
                  Planet_updatedAt: logPlanetUpdate.UpdatedAt,
                  Zone_createdAt: writeResult.writeTime.toDate(),
                  Updated_planetData: logPlanetUpdate,
                  Zone_data: newZone,
                }
                // Update User document Planet field with Zone_count
                return userDoc.get().then((userDocument) => {
                  userPlanetUpdate.Planets[planetName].Zone_count = updatedPlanet.Zone_count;
                  return userDocument.docs[0].ref.update(userPlanetUpdate).then((userWriteResult) => {
                    Response.User_updatedAt = userWriteResult.writeTime.toDate();
                    Response.Updated_userData = userPlanetUpdate;
                    // Return response data
                    console.dir({Request: req.body, Response}, {depth: null});
                    return res.status(200).send({Response});
                  });
                });
              });
            });
          } else {
            return res.status(500).send({Error: "Planet not found"});
          }
        });
      }
      }).catch((error) => {
      const logError = {
        Code: error.code,
        Message: error.message,
      };
      console.log(logError);
      return res.status(500).send(logError);
    });
  }
});


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
