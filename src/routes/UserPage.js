import React from 'react';
import NavBar from "../components/NavBar";
import PlanetOrbit from "../components/PlanetOrbit";
import PlanetButton from "../components/PlanetButton";
import {FaAirbnb} from "react-icons/fa";
function UserPage(props) {
    return (
        <main>
            <NavBar/>
            <div className=" grid grid-cols-1 md:grid-cols-3 gap-10 h-screen w-screen">
                <PlanetOrbit animated = {true} remainPlanets = {[<PlanetButton reactIcon = {<FaAirbnb/>} />, <PlanetButton/>]}/>
                <PlanetOrbit animated = {true} remainPlanets = {[<PlanetButton/>, <PlanetButton/>]}/>
                <PlanetOrbit animated = {true} remainPlanets = {[<PlanetButton/>, <PlanetButton/>]}/>
            </div>
        </main>
    );
}



export default UserPage;
