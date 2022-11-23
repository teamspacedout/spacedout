import React, {useState} from 'react';
import {motion} from "framer-motion";



function PlanetOrbit({defaultPlanet, animated, style, planetSize, orbitSize, distanceFromPlanet, remainPlanets}) {


    const [showButton, setButtonShown] = useState(false);
    const [planetButtons, setPlanetButtons] = useState(remainPlanets);

    const handleClick = (e) => {
        setButtonShown(current => !current);
        console.log(showButton)
    }

    /*
         Properties for Angle on React PlanetOrbit Sub System,
         Utilizing Grid Layout
     */

    const sections = ["col-start-1 col-end-2", "col-start-2 col-end-3", "col-start-3 col-end-4"];
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
        position: "absolute",
        top: 0,
        left: 0,
        width: "calc( 100% - 2px * 2)",
        height: "calc( 100% - 2px * 2 )",
        borderRadius: "50%",

    }

    console.log(remainPlanets)

    /*
         We are going to add int out grid the planets in the following order:

         top - left

         top - right

     */
    return (
        <div style={circleGraph} className="place-self-center ">
                <div style= {outerCircle}>
                        <div className="grid grid-cols-3 gap-10 grid-flow-row">

                            <div className=" col-start-1 col-end-2 btn-circle ">
                            {showButton && (
                                <span  >
                                    {planetButtons[0]}
                                </span>
                            )}
                            </div>

                            <div className=" -translate-y-10  col-start-2 col-end-3 btn-circle">
                            {showButton && (
                                <span  >
                                    {planetButtons[0]}
                                 </span>
                            )}
                            </div>

                            <div className=" col-start-3 col-end-4 btn-circle">
                            {showButton && (
                                <span  >
                                    {planetButtons[0]}
                                </span>
                            )}
                            </div>

                            <div className=" -translate-x-10 col-start-1 col-end-2 btn-circle">
                            {showButton && (
                                <span  >
                                     {planetButtons[0]}
                                </span>
                            )}
                            </div>

                            <div onClick={handleClick}>
                                <DefaultPlanet/>
                            </div>

                            <div className=" col-start-3 col-end-4 translate-x-10 btn-circle">
                            {showButton && (
                                <span  >
                                    {planetButtons[0]}
                                </span>
                            )}
                            </div>

                            <div className="btn-circle">
                            {showButton && (
                                <span>
                                     {planetButtons[1]}
                                 </span>
                            )}
                            </div>

                            <div className=" translate-y-10  col-start-2 col-end-3 btn-circle">
                            {showButton && (
                                <span  >
                                    {planetButtons[0]}
                                 </span>
                            )}
                            </div>

                            <div className=" col-start-3 col-end-4 btn-circle">
                            {showButton && (
                                <span  >
                                     {planetButtons[0]}
                                 </span>
                            )}
                            </div>

                        </div>


                </div>


        </div>
    );
}

PlanetOrbit.defaultProps = {
    defaultPlanet: <DefaultPlanet/>,
    animated : true,
    planetSize: 40,
    orbitSize: 10,
    distanceFromPlanet: 30,
    remainPlanets: true
};


function DefaultPlanet (props) {
    return <div className="image-full scale-250 btn-circle shadow-md shadow-purple-200">
        <img src="/assests/planets/Earth/4.png"/>
    </div>
}
export default PlanetOrbit;
