import { transform } from 'lodash';
import React, {useContext, useEffect, useState} from 'react';
import {FaHome, FaLock, FaMapMarker, FaPen, FaUserFriends} from 'react-icons/fa'
import{MdPersonPinCircle} from 'react-icons/md'
import PlanetOrbit from "../components/PlanetOrbit";
import PlanetButton from "../components/PlanetButton";
import Planet from "../components/Planet";
import NamePlate from "../components/NamePlate";
import NavBar from "../components/NavBar"
import {FaAirbnb, FaFacebook, FaGoogle, FaInstagram, FaMagic, FaTiktok, FaTumblr, FaYahoo} from "react-icons/fa";
import axios from "axios";
import UserLogin from "../lib/context";
import Loading from "../components/Loading";
import {APIURL} from "../firebase";



function PlanetPage(){

    const {user, username} = useContext(UserLogin);
    const [page, setPage] = useState({data: null});



    useEffect(() => {

        (async () => {
            setPage({data: (await getPlanetData()).data})
        })()


    }, [username]);

    console.log(page);


    async function getPlanetData () {

        if(username) {
            const name = (window.location.pathname).slice(username.length + 2);
            console.log(name);
            try {
                return await axios.get(`${APIURL}/db/user/${username}/planet/${name}`);
            } catch (e) {
                console.log(e);
            }
        }
    }


    if(page.data && user) {
  return (
      <div className="drawer">
          <input id="my-drawer" type="checkbox" className="drawer-toggle" />
          <div className="drawer-content">

              <div className="grid grid-cols-3">
                  <h1 className="text-white pt-14 col-start-2 col-end-3 text-xl text-center font-bold tracking-tight sm:text-center sm:text-6xl ">
                      Welcome to {page.data.Planet_name}
                  </h1>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'start', height: '75vh',}}>

              <PlanetOrbit  showOrbit={true}
                            scale={"175%"}
                            defaultPlanet= {<Planet img = {`${page.data.Planet_image}`} scale={"125%"}/>}
                            remainPlanets = {[<PlanetButton Link = ""
                                                            scale={.6}
                                                            reactIcon = {<FaPen className="text-white"/>}
                                                            btnProperties = "btn-circle bg-purple-800 grid place-items-center"
                                                            toolTip = "Planet Bio"/>
                                , <PlanetButton  html = "my-drawer" Link = "/" btnProperties = "btn-circle bg-blue-800 grid place-items-center" reactIcon = {<FaHome className="text-white"/>} scale={.6}  />
                                , <PlanetButton  Link = "" btnProperties = "btn-circle bg-green-800 grid place-items-center" reactIcon = {<FaUserFriends className="text-white"/>} scale={.6} toolTip = {"Friends"}/>
                                , <PlanetButton  Link = "" btnProperties = "btn-circle bg-black grid place-items-center" scale = {.6} toolTip = "Lock" reactIcon = {<FaLock className="text-white scale-150"/>} />
                                , <PlanetButton  Link = "" btnProperties = "btn-circle bg-black grid place-items-center" scale = {.6} toolTip = "Lock" reactIcon = {<FaLock className="text-white scale-150"/>} />
                                , <PlanetButton  Link = "" btnProperties = "btn-circle bg-black grid place-items-center" scale = {.6} toolTip = "Lock" reactIcon = {<FaLock className="text-white scale-150"/>} />
                                , <PlanetButton  Link = "" btnProperties = "btn-circle bg-black grid place-items-center" scale = {.6} toolTip = "Lock" reactIcon = {<FaLock className="text-white scale-150"/>} />
                                , <PlanetButton  Link = "" btnProperties = "btn-circle bg-black grid place-items-center" scale = {.6} toolTip = "Lock" reactIcon = {<FaLock className="text-white scale-150"/>} />

                            ]}
              />
              </div>
          </div>
          <div className="drawer-side">
              <label htmlFor="my-drawer" className="drawer-overlay"></label>
              <ul className="menu p-4 w-80 bg-base-100 text-base-content">

                  <li><a>Sidebar Item 1</a></li>
                  <li><a>Sidebar Item 2</a></li>

              </ul>
          </div>
      </div>
  );
}

    /*
      <>
        <div className="drawer" >

            <div className ="grid grid-cols-1 gap-4">
                <input id="my-drawer" type="checkbox" className="drawer-toggle" />
                <div className="drawer-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh',}}>
            <PlanetOrbit  showOrbit={true}
                    scale={"225%"}
                    defaultPlanet= {<Planet img = {`${page.data.Planet_image}`} scale={"125%"}/>}
                    remainPlanets = {[<PlanetButton Link = ""
                                                    scale={.6}
                                                    reactIcon = {<FaPen className="text-white"/>}
                                                    btnProperties = "btn-circle bg-purple-800 grid place-items-center"
                                                    toolTip = "Planet Bio"/>

                        , <PlanetButton Link = "/" btnProperties = "btn-circle bg-blue-800 grid place-items-center" reactIcon = {<FaHome className="text-white"/>} scale={.6}  />
                        , <label  htmlFor="my-drawer"> <PlanetButton  Link = "" btnProperties = "btn-circle bg-green-800 grid place-items-center" reactIcon = {<FaUserFriends className="text-white"/>} scale={.6} toolTip = {"Friends"}/> </label>
                        , <PlanetButton  Link = "" btnProperties = "btn-circle bg-black grid place-items-center" scale = {.6} toolTip = "Lock" reactIcon = {<FaLock className="text-white scale-150"/>} />
                        , <PlanetButton  Link = "" btnProperties = "btn-circle bg-black grid place-items-center" scale = {.6} toolTip = "Lock" reactIcon = {<FaLock className="text-white scale-150"/>} />
                        , <PlanetButton  Link = "" btnProperties = "btn-circle bg-black grid place-items-center" scale = {.6} toolTip = "Lock" reactIcon = {<FaLock className="text-white scale-150"/>} />
                        , <PlanetButton  Link = "" btnProperties = "btn-circle bg-black grid place-items-center" scale = {.6} toolTip = "Lock" reactIcon = {<FaLock className="text-white scale-150"/>} />
                        , <PlanetButton  Link = "" btnProperties = "btn-circle bg-black grid place-items-center" scale = {.6} toolTip = "Lock" reactIcon = {<FaLock className="text-white scale-150"/>} />

                    ]}
      />

            <div style={{
                display: 'inline-block',
                zIndex:'1',
                transform: 'translate(100px, 5px)'
            }}>
                <NamePlate plateColor={"green"} name={`${page.data.Planet_name}`}></NamePlate>
            </div>

            </div>
            <div className="drawer-side">
                <label htmlFor="my-drawer" className="drawer-overlay"></label>
                <ul className="menu p-4 w-80 bg-base-100 text-base-content">
                    <li><a>Sidebar Item 1</a></li>
                    <li><a>Sidebar Item 2</a></li>

                </ul>
            </div>

      </div>


    </div>
      </>
     */
    function onDivClick(event) {

    }

    return (
        <div>
            <Loading/>
        </div>
    )
}







export default PlanetPage;
