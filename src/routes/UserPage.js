import React, {useContext, useEffect, useState} from 'react';
import NavBar from "../components/NavBar";
import PlanetOrbit from "../components/PlanetOrbit";
import PlanetButton from "../components/PlanetButton";
import Planet from "../components/Planet";
import {FaAirbnb, FaFacebook, FaGoogle, FaInstagram, FaMagic, FaTiktok, FaTumblr, FaYahoo} from "react-icons/fa";
import axios from "axios";
import {useNavigate} from "react-router-dom";
import UserLogin from "../lib/context";
import NamePlate from "../components/NamePlate";
import Loading from "../components/Loading";
import {APIURL} from "../firebase";

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
            return await axios.get(`${APIURL}/db/user/${name}`);
        } catch (e) {
            return navigate('/404');
        }
    }


    if(!page.data) {
        return (
           <Loading/>
        )
    }

    return (
        <main>
            <NavBar/>
            <div className=" grid grid-rows-3 md:grid-cols-1 gap-3 h-screen">

                <div className="grid grid-cols-3">
                <h1 className="text-white pt-14 col-start-2 col-end-3 text-3xl text-center font-bold tracking-tight sm:text-center sm:text-6xl ">
                    Welcome to {page.data.Username}'s Profile.
                </h1>
                </div>

                <div className="row-start-2 row-end-4 grid md:grid-cols-3 ">
                        <div className="bg-blue-600 bg-opacity-30 col-span-2 ">

                            <div className="card bg-blue-600 sm:bg-primary bg-opacity-30 sm:bg-opacity-70 text-primary-content md:m-10 grid md:grid-cols-2 ">
                                <div className="card-body">

                                    <h2 style={{fontSize: "4em"}} className="card-title">
                                        <div className="avatar online">
                                            <div className="w-24 rounded-full">
                                                <img src={page.data.Image_Url}/>
                                            </div>
                                        </div>
                                        {page.data.Username}
                                    </h2>
                                    <div className="btn-group btn-group-vertical md:btn-group-horizontal m-4 ">
                                        <button className="btn btn-active "> Add Friend </button>
                                        <button className="btn">  Message </button>
                                        <button className="btn">  Explore Planets </button>
                                    </div>
                                    <h1 className="sm:text-4xl capitalize font-space italic underline">MISSION LOG</h1>
                                    <p>{page.data.Profile_data.Bio}</p>
                                    <div className="card-actions justify-end">
                                    </div>
                                </div>
                                <div className="grid place-content-center">
                                    <div className="stats stats-vertical shadow bg-purple-500 text-white m-4 scale-75">

                                        <div className="stat">
                                            <div className="stat-title">Planet Count</div>
                                            <div className="stat-value">{page.data.Planet_count}</div>
                                            <div className="stat-desc"></div>
                                        </div>

                                        <div className="stat">
                                            <div className="stat-title">Friend Count</div>
                                            <div className="stat-value">{page.data.Friend_count}</div>
                                            <div className="stat-desc"></div>
                                        </div>

                                        <div className="stat">
                                            <div className="stat-title">Account Created</div>
                                            <div className="stat-value">12/14/2022</div>
                                            <div className="stat-desc"></div>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>


                    {

                    }
                        <div className="rounded bg-blue-600 md:bg-opacity-30 flex flex-row md:flex-col place-items-center">


                            <h1 className="text-white text-4xl text-center font-bold tracking-tight sm:text-center sm:text-6xl font-space">
                                    {(page.data.Username)}'s featured planet
                            </h1>

                            <div className="grid grid-rows-1 place-items-center animate-spin-slow">
                            <PlanetOrbit
                                scale={"100%"}
                                defaultPlanet={<Planet img={"/assests/planets/Gas/1.png"}/>}
                                remainPlanets={[<PlanetButton/>,
                                    <PlanetButton/>,
                                    <PlanetButton/>,
                                    <PlanetButton/>,
                                    <PlanetButton/>,
                                    <PlanetButton/>,
                                    <PlanetButton/>,
                                    <PlanetButton/>]}

                            >
                            </PlanetOrbit>
                            </div>
                        </div>
                </div>

            </div>
        </main>
    );
}
/*
       <PlanetOrbit
                    scale={"200%"}
                    defaultPlanet= {<Planet scale={"70%"} img = "/assests/planets/Lava/4.png"/>}
                    remainPlanets = {
                    [   <PlanetButton scale = {0.75} btnProperties = "btn-circle bg-red-500 grid place-items-center" reactIcon = {<FaAirbnb className="text-white"/>} />,
                        <PlanetButton scale = {0.75} btnProperties = "btn-circle bg-blue-500 grid place-items-center" reactIcon = {<FaFacebook className="text-white"/>}/>,
                        <PlanetButton scale = {0.75} btnProperties = "btn-circle bg-purple-500 grid place-items-center" reactIcon = {<FaInstagram className="text-white"/>}/>,
                        <PlanetButton scale = {0.75} btnProperties = "btn-circle bg-yellow-500 grid place-items-center" reactIcon = {<FaYahoo className="text-white"/>}/>,
                        <PlanetButton scale = {0.75} btnProperties = "btn-circle bg-green-500 grid place-items-center" reactIcon = {<FaTiktok className="text-white"/>}/>,
                        <PlanetButton scale = {0.75} btnProperties = "btn-circle bg-orange-500 grid place-items-center" reactIcon = {<FaTumblr className="text-white"/>}/>,
                        <PlanetButton scale = {0.75} btnProperties = "btn-circle bg-pink-500 grid place-items-center" reactIcon = {<FaMagic className="text-white"/>}/>,
                        <PlanetButton scale = {0.75} btnProperties = "btn-circle bg-gray-500 grid place-items-center" reactIcon = {<FaGoogle className="text-white"/>}/>,
                    ]}/>

                <div className="text-white place-self-center">
                    <div> Username: {page.data.Username} </div>
                    <div> User ID:  {page.data.uid} </div>
                    <div> Friend Count: {page.data.Friend_count} </div>
                    <div> Planet Count: {page.data.Planet_count} </div>
                    <div> {page.data.Profile_data.Bio}</div>
                </div>
 */


export default UserPage;
