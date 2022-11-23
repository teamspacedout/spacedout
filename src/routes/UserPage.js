import React from 'react';
import NavBar from "../components/NavBar";
import PlanetOrbit from "../components/PlanetOrbit";
import PlanetButton from "../components/PlanetButton";
import Planet from "../components/Planet";
import {FaAirbnb, FaFacebook, FaGoogle, FaInstagram, FaMagic, FaTiktok, FaTumblr, FaYahoo} from "react-icons/fa";
function UserPage(props) {
    return (
        <main>
            <NavBar/>
            <div className=" grid grid-cols-1 md:grid-cols-3 gap-10 h-screen w-screen">
                <PlanetOrbit
                    defaultPlanet= {<Planet img = "/assests/planets/Lava/4.png"/>}
                    remainPlanets = {
                    [   <PlanetButton btnProperties = "btn-circle bg-red-500 grid place-items-center" reactIcon = {<FaAirbnb className="text-white"/>} />,
                        <PlanetButton btnProperties = "btn-circle bg-blue-500 grid place-items-center" reactIcon = {<FaFacebook className="text-white"/>}/>,
                        <PlanetButton btnProperties = "btn-circle bg-purple-500 grid place-items-center" reactIcon = {<FaInstagram className="text-white"/>}/>,
                        <PlanetButton btnProperties = "btn-circle bg-yellow-500 grid place-items-center" reactIcon = {<FaYahoo className="text-white"/>}/>,
                        <PlanetButton btnProperties = "btn-circle bg-green-500 grid place-items-center" reactIcon = {<FaTiktok className="text-white"/>}/>,
                        <PlanetButton btnProperties = "btn-circle bg-orange-500 grid place-items-center" reactIcon = {<FaTumblr className="text-white"/>}/>,
                        <PlanetButton btnProperties = "btn-circle bg-pink-500 grid place-items-center" reactIcon = {<FaMagic className="text-white"/>}/>,
                        <PlanetButton btnProperties = "btn-circle bg-gray-500 grid place-items-center" reactIcon = {<FaGoogle className="text-white"/>}/>,
                    ]}/>
                <PlanetOrbit
                    defaultPlanet= {<Planet img = "/assests/planets/Ice/4.png"/>}
                    remainPlanets = {[<PlanetButton/>, <PlanetButton/>]}/>
                <PlanetOrbit  showOrbit={true} remainPlanets = {[<PlanetButton/>, <PlanetButton/>, <PlanetButton/>, <PlanetButton/>, <PlanetButton/>, <PlanetButton/>, <PlanetButton/>,<PlanetButton/>, <PlanetButton/>]}/>
            </div>
        </main>
    );
}



export default UserPage;
