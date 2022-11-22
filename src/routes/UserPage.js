import React from 'react';
import NavBar from "../components/NavBar";
import Planet from "../components/Planet";
import PlanetButton from "../components/PlanetButton";
function UserPage(props) {
    return (
        <main>
            <NavBar/>
            <div className="display grid place-items-center h-screen w-screen">
                <Planet animated = {true} remainPlanets = {[<PlanetButton/>, <PlanetButton/>]}/>
            </div>
        </main>
    );
}



export default UserPage;
