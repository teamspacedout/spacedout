import {useAuthState} from "react-firebase-hooks/auth";
import {fireDB, fireAuth, collection, doc, onSnapshot} from "../firebase";
import {useEffect, useState} from "react";

export function useUserAuth() {
    const [user] = useAuthState(fireAuth);
    const [username, setUsername] = useState(null);

    useEffect(() => {

        let unsubscribe;

        if(user) {
            const userRef = collection(fireDB, 'Users');
            const refDoc = doc(userRef, user.uid);

            unsubscribe = onSnapshot(refDoc, (doc) => {
                setUsername(doc.data()?.username);
            })
        } else {
            setUsername(null);
        }

        return unsubscribe;

    }, [user])

    return {user, username};
}
