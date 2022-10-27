import React from 'react';
import {Link} from "react-router-dom";

function NavBar() {
    return (
        <div className="navbar absolute">
            <div className="flex-1">
                <Link to = '/' className="btn btn-ghost text-white normal-case text-xl">Spaced Out</Link>
            </div>
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

export default NavBar;