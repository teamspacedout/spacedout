const utils = require("../utils/config");
const firestore = utils.firestore;
const admin = utils.admin;



/** DB endpoint: Queries the database for a list of planets
 * under a specific user
 * @param req.params: { username }
 * @return Array - An array containing the Planets documents data
 */
const getPlanets = (req, res) => {
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
};

/** DB endpoint: Queries the database for a specific planet
 * under a specific user
 * @param req.params: { username, planet }
 * @return Map - An object containing the Planet document data
 */
const getPlanet = (req, res) => {
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
};

/** DB endpoint: Updates the document for a specific planet
 * under a specific user
 * @param req.params: { username, planet }
 * @param req.body:
 * {
 *      planetName,                         (String) [OPTIONAL]
 *      planetDescription,                  (String) [OPTIONAL]
 *      planetImage,                        (String) [OPTIONAL]
 *      planetSettings,                     (Map)    [OPTIONAL]
 *      tags,                               (Array)  [OPTIONAL]
 * }
 * @return Map - An object containing the Planet document data
 */
const updatePlanet = (req, res) => {
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
        Tags: req.body.tags && req.body.tags.length > 0 ? req.body.tags : undefined,
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
};

/** DB endpoint: Deletes the document for a specific planet
 * under a specific user
 * @param req.params: { username, planet }
 * @return Map - An object containing the Planet document data
 */
const deletePlanet = (req, res) => {
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
};

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
const createPlanet = (req, res) => {
    console.dir({Request: req.body}, {depth: null});

    const username = req.params.username.trim();
    const planetName = req.body.planetName.trim();
    const planetDescription = req.body.planetDescription ? req.body.planetDescription.trim() : "";
    const planetImage = req.body.planetImage ? req.body.planetImage.trim() : "";
    const planetTags = req.body.planetTags && req.body.planetTags.length > 0 ? req.body.planetTags : [];

    const usersRef = firestore.collection("Users");
    const userDoc = usersRef.where("Username", "==", username).limit(1);
    let uid = "";

    // Validate User is in the Users collection
    return userDoc.get().then((userDocument) => {
        if (userDocument && userDocument.docs.length > 0) {
        uid = userDocument.docs[0].data().uid;
        } else {
        uid = "invalid";
        }
        return uid;
    }).then((foundUid) => {
        if (foundUid === "invalid") {
        return res.status(500).send({Error: "User not found!"});
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
                Planet_image: planetImage,
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
                        Planet_createdAt: writeTime.writeTime.toDate(),
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
};

module.exports = { createPlanet, getPlanets, getPlanet, updatePlanet, deletePlanet};