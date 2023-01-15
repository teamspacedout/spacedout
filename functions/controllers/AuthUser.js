const utils = require("../utils/config");
const admin = utils.admin;
const auth = admin.auth();
const firestore = utils.firestore;

/** Auth endpoint: Queries Firebase Auth for a list of users
 * @return: Array - An array containing the UserRecord Auth objects
 * Currently limits request to 100 users
 */
const getUsers = (req, res) => {
    const usersList = [];
    return auth
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
            return res.send(usersList);
        })
        .catch((error) => {
            return res.status(400).send(error.code);
        });
};

/** Auth endpoint: Queries Firebase Auth for a specific user
 * @param req.params: { user: The auth uid of the user }
 * @return Map - An object containing the UserRecord Auth data
 */
const getUser = (req, res) => {
    const userId = req.params.user.trim();
    return auth.getUser(userId).then((userRecord) => {
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
        return res.status(200).send(userData);
    }).catch((error) => {
        return res.status(400).send(error.code);
    });
};

/** Auth endpoint: Updates Firebase Auth for a specific user
 * @param req.params: { user: The auth uid of the user }
 * @param req.body: The data to update the auth record with
 * req.body can update the following properties:
 * {email, phoneNumber, emailVerified, password, displayName, photoUrl, disabled}
 * @return: Map - An object containing success state and updated user data }
 */

const updateUser = (req, res) => {
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
                    const errorMessage = {Error: `Username ${newUsername} is already taken.`};
                    return res.status(500).send(errorMessage);
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
        return res.status(500).send(errorResponse);
        });
    }
};

/** Auth endpoint: Deletes Firebase Auth for a specific user
 * Additionally deletes the user's User document and Username
 * documents recursively
 * @param req.params: { user: The auth uid of the user }
 * @return: Map - An object containing success state and deleted user data
 */
const deleteUser = (req, res) => {
    const uid = req.params.user.trim();

    // Validate if user exists
    return auth.getUser(uid).then((userRecord) => {
        if (userRecord.uid && userRecord.uid === uid) {
        const username = userRecord.displayName;

        return auth.deleteUser(uid).then(() => {
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
};

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
async function createUser({data, context}) {
     // Create User Auth object from request data
    const user = {
        email: data.email ? data.email.trim() : undefined,
        emailVerified: false,
        password: data.password ? data.password.trim() : undefined,
        displayName: data.displayName ? data.displayName.trim() : undefined,
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
        return {Error: errorMessage};
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
        return {user};
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
    return {Error: errorResponse};
    });
}
}

module.exports = { createUser, getUsers, getUser, updateUser, deleteUser};
