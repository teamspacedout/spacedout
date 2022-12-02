import React, {useContext, useEffect, useState} from 'react';
import NavBar from "../components/NavBar";
import PlanetOrbit from "../components/PlanetOrbit";
import PlanetButton from "../components/PlanetButton";
import Planet from "../components/Planet";
import {FaAirbnb, FaFacebook, FaGoogle, FaInstagram, FaMagic, FaTiktok, FaTumblr, FaYahoo} from "react-icons/fa";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import UserLogin from "../lib/context";

function UserPage() {

    //const [person, username] = useContext(UserLogin);
    const name = (window.location.pathname).slice(1);
    const navigate = useNavigate();

    const {user, username} = useContext(UserLogin);
    const [page, setPage] = useState({data: null});


    useEffect(() => {

        (async () => {
            setPage({data: (await getData()).data})
        })()


    }, []);


    /**
     *
     *  @12/1/2022 - Using local API endpoints, will need to be adjusted to live version at some point
     * @returns Axios Promise or Naviagtes to 404 Page if fails :(
     */
    async function getData() {
        try {
            return await axios.get(`http://127.0.0.1:5001/lateral-incline-365622/us-central1/app/api/db/user/${name}`);
        } catch (e) {
            return navigate('/404');
        }
    }


    return (
        <main>
            <NavBar/>
            <div className=" grid grid-cols-1 md:grid-cols-3 gap-10 h-screen w-screen">
                <PlanetOrbit
                    scale={"130%"}
                    defaultPlanet= {<Planet scale={"100%"} img = "/assests/planets/Lava/4.png"/>}
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
