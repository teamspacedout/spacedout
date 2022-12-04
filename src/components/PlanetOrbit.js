import React, {useState} from 'react';
import {motion} from "framer-motion";



function PlanetOrbit({defaultPlanet, animated, remainPlanets, showOrbit, scale}) {


    const [showButton, setButtonShown] = useState(showOrbit);
    const [planetButtons] = useState(remainPlanets);

    const handleClick = (e) => {
        setButtonShown(current => !current);
    }

    /*
         Properties for Angle on React PlanetOrbit Sub System,
         Utilizing Grid Layout
     */

    const circleGraph = {
            scale: `${scale}`,
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
                                    {planetButtons[1]}
                                 </span>
                            )}
                            </div>

                            <div className=" col-start-3 col-end-4 btn-circle">
                            {showButton && (
                                <span  >
                                    {planetButtons[2]}
                                </span>
                            )}
                            </div>

                            <div className=" -translate-x-10 col-start-1 col-end-2 btn-circle">
                            {showButton && (
                                <span  >
                                     {planetButtons[3]}
                                </span>
                            )}
                            </div>

                            <div onClick={handleClick} className="cursor-pointer">
                                {animated ? <motion.div
                                    whileHover={{
                                        scale: 1.1,
                                        transition: { duration: 1 },
                                    }}

                                >
                                    {defaultPlanet}
                                </motion.div> : defaultPlanet}

                            </div>

                            <div className=" col-start-3 col-end-4 translate-x-10 btn-circle">
                            {showButton && (
                                <span className="cursor-pointer">
                                    {planetButtons[4]}
                                </span>
                            )}
                            </div>

                            <div className="btn-circle">
                            {showButton && (
                                <span>
                                     {planetButtons[5]}
                                 </span>
                            )}
                            </div>

                            <div className=" translate-y-10  col-start-2 col-end-3 btn-circle">
                            {showButton && (
                                <span  >
                                    {planetButtons[6]}
                                 </span>
                            )}
                            </div>

                            <div className=" col-start-3 col-end-4 btn-circle">
                            {showButton && (
                                <span  >
                                     {planetButtons[7]}
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
    remainPlanets: true,
    scale: "100%"
};


function DefaultPlanet () {
    return <div className="image-full scale-250 btn-circle shadow-md shadow-purple-200">
        <img alt = "Image Icon" src="/assests/planets/Earth/4.png"/>
    </div>
}
export default PlanetOrbit;
