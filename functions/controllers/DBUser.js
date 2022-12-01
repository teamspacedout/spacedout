const utils = require("../utils/config");
const firestore = utils.firestore;



/** DB endpoint: Queries the database for a list of 50 users
 * @return: Array - An array containing the Users documents data
 */
const getUsers = (req, res) => {
    const usersDocuments = [];
    return firestore.collection("Users").limit(50).get()
    .then((docs) => {
        docs.forEach((doc) => {
        usersDocuments.push(doc.data());
        });
        return res.status(200).send(usersDocuments);
    }).catch((error) => {
        return res.status(400).send({Error: error.code});
    });
};

/** DB endpoint: Queries the database for a specific user
   * @param req.params: { username }
   * @return Map - An object containing the User document data
   */
const getUser = (req, res) => {
    const username = req.params.username.trim();

    return firestore.collection("Users").where("Username", "==", username).limit(1)
        .get().then((userDoc) => {
            return res.status(200).send(userDoc.docs[0].data());
        }).catch((error) => {
            return res.status(400).send({error: error.code});
        });
};

/** DB endpoint: Updates the document for a specific user
   * @param req.params: { username }
   * @param req.body:
   * {
   *      profileData,         (Map)
   *      profileSettings,     (Map)
   * }
   * @return Map - An object containing the updated User document data
   */
const updateUser = (req, res) => {
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
};

module.exports = { getUsers, getUser, updateUser};