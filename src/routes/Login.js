import React, {useEffect, useState} from 'react';
import { fireAuth, fireDB, fireStorage, fireLytics } from "../firebase";
import {collection, getDocs} from 'firebase/firestore'


function Login() {

    const [users, setUsers] = useState([]);
    const usersCollection = collection(fireDB, "Users");

    useEffect(() => {
        const getUsers = async () => {
            const data = await getDocs(usersCollection)
            setUsers(data.docs.map((doc) => ({...doc.data(), id: doc.id})))
        }

        getUsers();
    })

    return (
        <div>{users.map((user) => {
            return <div>
                <h1>Name: {user.id}</h1>
                <h1>Zone_Count: </h1>
            </div>
        } )}</div>
    );
}

export default Login;
