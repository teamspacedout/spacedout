import React, {useContext, useEffect, useState} from 'react';
import NavBar from "../components/NavBar";
import UserLogin from "../lib/context";
import axios from "axios";
import Loading from "../components/Loading";
import Planet from "../components/Planet";
import {Link} from "react-router-dom";



function EditPlanet() {
    const {user, username} = useContext(UserLogin);
    const [planets, setPlanets] = useState({data: null});
    //const []
    console.log(username);
    console.log(planets.data)

    useEffect(() => {


        (async () => {
            setPlanets({data: (await createPlanet()).data})
        })()

    }, [username]);

    async function createPlanet () {

        if(username) {
            try {
                console.log(`http://127.0.0.1:5001/lateral-incline-365622/us-central1/app/api/db/user/${username}/planets`);
                return await axios.get(`http://127.0.0.1:5001/lateral-incline-365622/us-central1/app/api/db/user/${username}/planets`);
            } catch (e) {
                console.log(e);
            }
        }
    }

    if(planets.data && user) {
        return (
            <div className="h-screen">
                <NavBar/>

                <div className="p-14 text-center text-white text-5xl font-space"> Click on a planet to edit</div>
                <div className="w-screen mt-14 grid grid-cols-3 place-content-center gap-20">

                    {planets.data.map((planet) => {
                        return <div className="text-white place-self-center flex flex-col place-items-center">
                            <Link to = {`../${username}/${planet.Planet_name}`}>
                                <Planet scale="50%" img={`${planet.Planet_image}`}/>
                            </Link>
                            <div className=" text-2xl p-3"> {`${planet.Planet_name}`} </div>
                        </div>
                    })}
                    This is the Edit Planet Page
                </div>
            </div>
        );
    } else {
        return (
            <div>
                <Loading/>
            </div>
        )
    }

}

export default EditPlanet;
