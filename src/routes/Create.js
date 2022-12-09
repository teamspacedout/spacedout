import React, {useContext, useState} from 'react';
import axios from "axios";
import FadingText from "../components/FadingText";
import {AnimatePresence} from "framer-motion";
import PlanetOrbit from "../components/PlanetOrbit";
import Planet from "../components/Planet";
import PlanetButton from "../components/PlanetButton";
import {FaHome, FaLock} from "react-icons/fa";
import {Link} from "react-router-dom";
import UserLogin from "../lib/context";





function Create() {

    const {user, username} = useContext(UserLogin);
    console.log(user);
    console.log(username);

    const [loaded, setLoaded] = useState(false);
    const [pageState, setPageState] = useState("start");
    const [planetType, setPlanetType] = useState("Lava");
    const [imageNumber, setImageNumber] = useState(1);
    const [planetInfo, setPlanetInfo] = useState({
        Creation_time: `Date and Time`,
        uid: `Text String`,
        Username: `Text String`,
        Planet_name: `Donkey Planet`,
        Planet_description: `Text String`,
        Planet_image: `Reference`,
    })

    console.log(planetInfo);

    const handlePlanetName = (event) => {
        setPlanetInfo({...planetInfo,
            Planet_name: event.target.value
        })
    }
    const pagePlanetTypeUpdate = (type) => {
        setPlanetType(type);
    }
    function pageStateUpdate(info) {
        setPageState(info);
    }

    function planetSelection(type) {
        switch(planetType) {
            case "Desert":
                if(type === "left"){
                    if(imageNumber === 1) {
                        setImageNumber(8)
                    } else {
                        setImageNumber(imageNumber - 1);
                    }
                } else {
                    if(type === "right") {
                        if(imageNumber === 8) {
                            setImageNumber(1);
                        } else {
                            setImageNumber(imageNumber + 1)
                        }
                    }
                }
                break;
            case "Earth":
                if(type === "left"){
                    if(imageNumber === 1) {
                        setImageNumber(16)
                    } else {
                        setImageNumber(imageNumber - 1);
                    }
                } else {
                    if(type === "right") {
                        if(imageNumber === 16) {
                            setImageNumber(1);
                        } else {
                            setImageNumber(imageNumber + 1)
                        }
                    }
                }
                break;
            case "Forest":
                if(type === "left"){
                    if(imageNumber === 1) {
                        setImageNumber(14)
                    } else {
                        setImageNumber(imageNumber - 1);
                    }
                } else {
                    if(type === "right") {
                        if(imageNumber === 14) {
                            setImageNumber(1);
                        } else {
                            setImageNumber(imageNumber + 1)
                        }
                    }
                }
                break;
            case "Gas":
                if(type === "left"){
                    if(imageNumber === 1) {
                        setImageNumber(16)
                    } else {
                        setImageNumber(imageNumber - 1);
                    }
                } else {
                    if(type === "right") {
                        if(imageNumber === 16) {
                            setImageNumber(1);
                        } else {
                            setImageNumber(imageNumber + 1)
                        }
                    }
                }
                break;
            case "Ice":
                if(type === "left"){
                    if(imageNumber === 1) {
                        setImageNumber(4)
                    } else {
                        setImageNumber(imageNumber - 1);
                    }
                } else {
                    if(type === "right") {
                        if(imageNumber === 4) {
                            setImageNumber(1);
                        } else {
                            setImageNumber(imageNumber + 1)
                        }
                    }
                }
                break;
            case "Lava":
                if(type === "left"){
                    if(imageNumber === 1) {
                        setImageNumber(12)
                    } else {
                        setImageNumber(imageNumber - 1);
                    }
                } else {
                    if(type === "right") {
                        if(imageNumber === 12) {
                            setImageNumber(1);
                        } else {
                            setImageNumber(imageNumber + 1)
                        }
                    }
                }
                break;
        }
    }

    async function createPlanet () {

        try {
        const res = await axios.post(`http://127.0.0.1:5001/lateral-incline-365622/us-central1/app/api/db/user/${username}/createPlanet`,
            {
                planetName: planetInfo.Planet_name,
                planetImage: `/assests/planets/${planetType}/${imageNumber}.png`,
            });
    } catch (e) {
            console.log(e);
        }
    }

    if(!user) {
        return(
            <AnimatePresence>
                <div className="h-screen grid place-content-center">
                    <FadingText heading = "Log in to create a Planet" subheading= ""/>

                    <Link to = '/' className="place-self-center place-self-center m-10 w-1/4 btn btn-md bg-purple-400">
                        Home
                    </Link>
                </div>
            </AnimatePresence>
        )
    }

    switch(pageState) {
        case "start":
            return(
                <AnimatePresence>
                <div className="h-screen grid place-content-center">
                    <FadingText heading = "Your journey starts here." subheading= "What would you like to name your planet?"/>

                    <input className="input" id="planet" onChange={handlePlanetName} type="text" />

                    <div  className=" place-self-center m-10 w-1/4 btn btn-md bg-purple-400" onClick={() => pageStateUpdate("chooseType")}>
                    Next
                    </div>
                </div>
                </AnimatePresence>
            )
        case "chooseType":
            return(
                <div className="h-screen grid place-content-center">
                    <FadingText heading = "Choose A Planet Type" subheading= ""/>

                    <div className="grid grid-cols-3 gap-10 ">
                        <button className="btn rounded-full bg-red-400" onClick={ event => {
                            pagePlanetTypeUpdate("Desert")
                            pageStateUpdate("chooseVariant")
                        }} > Desert </button>
                        <button className="btn rounded-full btn-md bg-teal-500" onClick={ event => {
                            pagePlanetTypeUpdate("Earth")
                            pageStateUpdate("chooseVariant")
                        }}> Earth </button>
                        <button className="btn rounded-full btn-md bg-green-500" onClick={ event => {
                            pagePlanetTypeUpdate("Forest")
                            pageStateUpdate("chooseVariant")
                        }}> Forest </button>
                        <button className="btn rounded-full btn-md bg-purple-200" onClick={ event => {
                            pagePlanetTypeUpdate("Gas")
                            pageStateUpdate("chooseVariant")
                        }}> Gas</button>
                        <button className="btn rounded-full btn-md bg-indigo-300" onClick={ event => {
                            pagePlanetTypeUpdate("Ice")
                            pageStateUpdate("chooseVariant")
                        }}> Ice</button>
                        <button className="btn rounded-full btn-md bg-red-600"  onClick={ event => {
                            pagePlanetTypeUpdate("Lava")
                            pageStateUpdate("chooseVariant")
                        }}> Lava</button>
                    </div>
                </div>
            )
        case "chooseVariant":
            return(
                <div className="h-screen grid place-content-center">
                    <FadingText heading = {`Pick ${planetType} planet`} subheading= ""/>
                        <div className="flex justify-center mb-14">
                            <img  alt="Planet Image" onLoad={() => setLoaded(true)} style={{scale: "240%"}} src={`/assests/planets/${planetType}/${imageNumber}.png`}/>
                        </div>
                    <div className="flex justify-center gap-12 w-full ">
                        <kbd onClick={(event) => planetSelection("left")} className=" scale-125 kbd hover:bg-purple-200 cursor-pointer">◀︎</kbd>
                        <kbd onClick={(event) => planetSelection("right")}  className=" scale-125 kbd hover:bg-purple-200 cursor-pointer">▶︎</kbd>
                    </div>

                    <div  className="place-self-center m-10 w-1/4 btn btn-md bg-purple-400" onClick={() => pageStateUpdate("zoneSelection")}>
                        Next
                    </div>
                </div>
            )
        case "zoneSelection":
            return(
                <div className="h-screen grid place-content-center">
                    <FadingText heading = {`Your planets have zones`} subheading= "In total you will have 8, but some are locked for now"/>
                    <div className="flex justify-center mb-14">
                        <PlanetOrbit
                            showOrbit={true}
                            defaultPlanet={<Planet img={`/assests/planets/${planetType}/${imageNumber}.png`}/>}
                            remainPlanets={
                            [   <PlanetButton toolTip = "Home Button" reactIcon = {<FaHome className="text-white-600 scale-150"/>}/>,
                                <PlanetButton toolTip = "Lock" reactIcon = {<FaLock className="text-gray-600 scale-150"/>}/>,
                                <PlanetButton toolTip = "Lock" reactIcon = {<FaLock className="text-gray-600 scale-150"/>}/>,
                                <PlanetButton toolTip = "Lock" reactIcon = {<FaLock className="text-gray-600 scale-150"/>} />,
                                <PlanetButton toolTip = "Lock" reactIcon = {<FaLock className="text-gray-600 scale-150"/>} />,
                                <PlanetButton toolTip = "Lock" reactIcon = {<FaLock className="text-gray-600 scale-150"/>} />,
                                <PlanetButton toolTip = "Lock" reactIcon = {<FaLock className="text-gray-600 scale-150"/>} />,
                                <PlanetButton toolTip = "Lock" reactIcon = {<FaLock className="text-gray-600 scale-150"/>} />,
                            ]
                        }
                        />
                    </div>
                    <div className="place-self-center m-10 w-1/4 btn btn-md bg-purple-400"  onClick={ event => {
                        pageStateUpdate("finish")
                        createPlanet();
                    }}>
                        Next
                    </div>
                </div>
            )
        case "finish":
            return(
                <AnimatePresence>
                <div className="h-screen grid place-content-center">
                    <FadingText heading = {`Good luck and have fun!`} subheading= "Your Journey Awaits!"/>
                        <Link to={'/'} className="place-self-center">
                            <Link to = '/' className="place-self-center place-self-center m-10 w-1/4 btn btn-md bg-purple-400">
                                Home
                            </Link>
                        </Link>
                </div>
                </AnimatePresence>
            )
        default:
            return(<div> Default this broken </div>)
    }
}

export default Create;