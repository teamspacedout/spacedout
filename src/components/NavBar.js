import React, {useContext} from 'react';
import {Link} from "react-router-dom";
import {MaintainAuthState} from "../lib/hooks";
import UserLogin from "../lib/context";
import {fireAuth, GoogleAuthProvider} from "../firebase";
import {signInWithPopup} from "firebase/auth";

function NavBar() {

    const {user, username} = useContext(UserLogin);

    console.log(user, username);

    return (
        <div className="navbar absolute">
            <div className="flex-1">
                <Link to = '/' className="btn btn-ghost text-white normal-case text-xl">Spaced Out</Link>
            </div>
            { !user ? <SignIn/> : <SignOut/> }
            <div className="justify-items-end dropdown dropdown-end">
                <label tabIndex="0" className="btn btn-ghost btn-circle avatar">
                    <div className="w-10 rounded-full">
                        <img alt='A picture of an ice planet TEMP' src="/assests/IcePlanet.png"/>
                    </div>
                </label>
                <ul tabIndex="0"
                    className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
                    <li> <Link to='/'> My Planet </Link> </li>
                    <li> <Link to='/'> Edit Planet </Link> </li>
                    <li> <Link to='/'> Free-Roam </Link> </li>
                    <li> <Link to= '/'>Settings</Link></li>
                    <li> <Link to= '/'>Logout</Link></li>
                </ul>
            </div>
        </div>
    );


}

function SignIn() {
    const logIn = new GoogleAuthProvider();

    const googleLogin = async () => {
        await signInWithPopup(fireAuth, logIn);
    }

    return (
    <button className="btn btn-info text-white" onClick={googleLogin}> Sign In </button>
    )
}

function SignOut() {
    return <button className="btn btn-primary" onClick={() => fireAuth.signOut()}> Sign Out </button>
}

export default NavBar;
