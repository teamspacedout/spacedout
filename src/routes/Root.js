import React from 'react';
import NavBar from "../components/NavBar";
import '../App.css';
import Footer from "../components/Footer";



function Root() {
    return (
        <main className="overflow-hidden">
            <NavBar/>
            <div className="flex flex-col  justify-between justify-center h-screen">
                <div>{
                    //Fake spacing for now
                }</div>
                <div className="self-center">
                <h1 className="text-3xl text-yellow-300 font-bold py-3 ">
            Search for a New Planet
        </h1>
            <input type="text" placeholder="Type here" className="input input-bordered w-full max-w-xs"/>
            </div>
                <Footer/>
            </div>
        </main>
    );
}

export default Root;