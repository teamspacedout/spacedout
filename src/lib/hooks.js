import {useAuthState} from "react-firebase-hooks/auth";
import {fireAuth} from "../firebase";
import {useEffect, useState} from "react";


export function useUserAuth() {
    const [user] = useAuthState(fireAuth);
    const [username, setUsername] = useState(null);

    useEffect(() => {
        if (user) {
            setUsername(user.displayName);
        } else {
            setUsername(null);

        }
    }, [user]);

    return {user, username};

}
