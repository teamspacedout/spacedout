import React from 'react';
import {Link} from "react-router-dom";

function FourZeroFour(props)
{
    return (
        <div className="flex flex-col h-screen w-screen place-items-center justify-center  ">
            <div>
                <img className="image-full" src="/assests/logo/logo-l.png"/>
            </div>
            <div className="text-xl text-red-50 place-items-center"> You are not in the right side of the galaxy, head <Link className="link link-primary text-purple-300" to='../'> home</Link> </div>
        </div>
    );
}

export default FourZeroFour;
