import React from 'react';
import {Link} from "react-router-dom";
import Logo from "../components/Logo";

function FourZeroFour(props)
{
    return (
        <div className="flex flex-col h-screen w-screen place-items-center justify-center  ">
            <div className="text-3xl text-white shadow-2xl shadow-purple-500">
                404
            </div>
            <Logo size="large"/>
            <div className="text-xl text-white place-items-center"> You are not in the right side of the galaxy, head <Link className="link link-primary text-purple-300" to='../'> home</Link> </div>
        </div>
    );
}

export default FourZeroFour;
