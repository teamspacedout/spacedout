import {useAuthState} from "react-firebase-hooks/auth";
import {fireDB, fireAuth, collection, doc, onSnapshot} from "../firebase";
import {useEffect, useState} from "react";

export function useUserAuth() {
    const [user] = useAuthState(fireAuth);
    const [username, setUsername] = useState(null);

    useEffect(() => {

        let unsubscribe;

        if(user) {
            const userRef = collection(fireDB, 'Usernames');
            const refDoc = doc(userRef, user.uid);

            console.log(refDoc);


            unsubscribe = onSnapshot(refDoc, (doc) => {
                setUsername(doc.data()?.name);
                console.log(doc.data()?.name);
            })
        } else {
            setUsername(null);
        }

        return unsubscribe;

    }, [user])

    return {user, username};
}
