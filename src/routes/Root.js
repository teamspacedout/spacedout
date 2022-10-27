import React from 'react';
import {Background} from "../components/Background";
import '../App.css';


function Root(props) {
    return (
        <main>
        <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl text-yellow-300 font-bold py-3 ">
            Spaced Out
        </h1>
            <div>
            <input type="text" placeholder="Type here" className="input input-bordered w-full max-w-xs"/>
            </div>
        </div>
        </main>
    );
}

export default Root;