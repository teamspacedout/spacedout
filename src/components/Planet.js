import React, {useEffect, useState} from 'react';
import {motion} from "framer-motion";
import PlanetButton from "./PlanetButton";



function Planet({defaultPlanet, animated, open, style, planetSize, orbitSize, distanceFromPlanet, remainPlanets}) {


    /*
         Properties for Angle on React Planet Sub System,
         Utilizing Grid Layout
     */

    const sections = ["col-start-1 col-end-2", "col-start-2 col-end-3", "col-start-3 col-end-4"];

    /*useEffect(() => {
        setAngle(angle + dangle);

    },
        [newAngle])*/


    const stylePlanet = {
        backgroundColor: "rgb(249 168 212 / var(--tw-bg-opacity))",
    };


    const circleGraph = {
            position: "relative",
            width: 200,
            height: 200,
            margin: "calc(100px / 2 + 0px)",
            padding: 40
    };

    const outerCircle = {
        display: "grid grid-flow-row-dense grid-cols-3 grid-rows-3 ",
        position: "absolute",
        top: 0,
        left: 0,
        width: "calc( 100% - 2px * 2)",
        height: "calc( 100% - 2px * 2 )",
        borderRadius: "50%",

    }

    //console.log(animated);

    const orbit = remainPlanets;
    console.log(remainPlanets)

    //const message = animated ? "It works" : "This is broken";


    /*
         We are going to add int out grid the planets in the following order:

         top - left

         top - right


     */
    return (
        <div style={circleGraph} className="place-self-center ">
                <div style= {outerCircle}>
                        <div className="grid grid-cols-3 gap-10 grid-flow-row">
                            <PlanetButton/>
                            <div className="p-5 -translate-y-10 btn-circle bg-purple-200 col-start-2 col-end-3"></div>
                            <div className="p-5 btn-circle bg-purple-400 col-start-3 col-end-4"></div>
                            <div className="p-5 -translate-x-10 btn-circle bg-purple-500 "></div>
                            <DefaultPlanet/>
                            <div className="p-5 translate-x-10 btn-circle bg-purple-700 "></div>
                            <div className="p-5 btn-circle bg-purple-800 "></div>
                            <div className="p-5 translate-y-10 btn-circle bg-purple-200 col-start-2 col-end-3"></div>
                            <div className="p-5 btn-circle bg-purple-900 col-start-3 col-end-4"></div>
                        </div>
                </div>

        </div>
    );
}

Planet.defaultProps = {
    defaultPlanet: <DefaultPlanet/>,
    animated : true,
    planetSize: 40,
    orbitSize: 10,
    distanceFromPlanet: 30,
    open: true,
    remainPlanets: true
};


function DefaultPlanet (props) {
    return <div style={props.futureStyle} className="image-full scale-250 btn-circle shadow-md shadow-purple-200">
        <img src="/assests/planets/Earth/4.png"/>
    </div>
}
export default Planet;
