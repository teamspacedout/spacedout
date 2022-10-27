import React from 'react';
import NavBar from "../components/NavBar";
import '../App.css';


function Root() {
    return (
        <main>
            <NavBar/>
            <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-3xl text-yellow-300 font-bold py-3 ">
            Search for a New Planet
        </h1>
            <div>
            <input type="text" placeholder="Type here" className="input input-bordered w-full max-w-xs"/>
            </div>
        </div>
        </main>
    );
}

export default Root;