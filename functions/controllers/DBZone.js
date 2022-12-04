const utils = require("../utils/config");
const firestore = utils.firestore;
const admin = utils.admin;




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

const createZone = (req, res) => {
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
}



module.exports = { createZone };