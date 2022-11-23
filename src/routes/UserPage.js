import React from 'react';
import NavBar from "../components/NavBar";
import Planet from "../components/Planet";
import PlanetButton from "../components/PlanetButton";
function UserPage(props) {
    return (
        <main>
            <NavBar/>
            <div className="display grid grid-cols-1 md:grid-cols-3 gap-10 h-screen w-screen">
                <Planet animated = {true} remainPlanets = {[<PlanetButton futureStyle = {{backgroundColor:'blue'}}/>, <PlanetButton/>]}/>
                <Planet animated = {true} remainPlanets = {[<PlanetButton futureStyle = {{backgroundColor:'blue'}}/>, <PlanetButton/>]}/>
                <Planet animated = {true} remainPlanets = {[<PlanetButton futureStyle = {{backgroundColor:'blue'}}/>, <PlanetButton/>]}/>
            </div>
        </main>
    );
}



export default UserPage;
