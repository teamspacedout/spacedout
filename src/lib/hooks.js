import {useAuthState} from "react-firebase-hooks/auth";
import {fireDB, fireAuth} from "../firebase";
import {useEffect, useState} from "react";

export function MaintainAuthState() {
    const [User] = useAuthState(fireAuth);
    const [username, setUsername] = useState(null);

    let unsubscribe;

    let userRef = a
}