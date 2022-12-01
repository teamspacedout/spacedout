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

           const value = doc(fireDB, "Users", user.uid)

            unsubscribe = onSnapshot(doc(fireDB, "Users", user.uid), (doc) => {
                console.log(doc.data());
                setUsername(doc.data()?.Username);
            })
        } else {
            setUsername(null);
            
        }

        return unsubscribe;

    }, [user])

    return {user, username};
}
