import React, {useContext} from 'react';
import {Link} from "react-router-dom";
import UserLogin from "../lib/context";
import {fireAuth} from "../firebase";
import Modal from "./Modal";

function NavBar() {

    const {user, username} = useContext(UserLogin);

    return (
        <div className="navbar absolute">

            <input type="checkbox" id="login" className="modal-toggle" />
            <Modal/>
            <div className="flex-1">
                <Link to = '/' className="btn btn-ghost text-white normal-case text-xl">Spaced Out</Link>
            </div>
            { !user ? <SignIn/> : <SignOut/> }
            { user &&
                <div className="justify-items-end dropdown dropdown-end">
                <label tabIndex="0" className="btn btn-ghost btn-circle avatar">
                    <div className="w-10 rounded-full">
                        <img alt='ice planet TEMP' src="/assests/IcePlanet.png"/>
                    </div>
                </label>
                <ul tabIndex="0"
                    className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
                    <li> <Link to={user ? `/${username}` : '/404'}> My Planets </Link> </li>
                    <li> <Link to={user ? `/create` : '/404'}> Create New Planet </Link> </li>
                    <li> <Link to= {user ? `/${username}/edit` : '/404' }> Edit Planets </Link> </li>
                    <li> <Link to='/freeroam'> Free-Roam </Link> </li>
                    <li> <Link to= '/'>Settings</Link></li>
                    <li> <Link to= '/'>Logout</Link></li>
                </ul>
            </div>
            }
        </div>
    );


}

function SignIn() {

    return (
    <label htmlFor="login" className="btn btn-info text-white"> Sign In </label>
    )
}

function SignOut() {
    return <button className="btn btn-primary" onClick={() => fireAuth.signOut()}> Sign Out </button>
}

export default NavBar;
