import React from 'react';
import {motion} from "framer-motion";

function Planet({defaultPlanet, animated, open, style, remainPlanets}) {


    //console.log(animated);

    const orbit = remainPlanets;
    console.log(remainPlanets)

    //const message = animated ? "It works" : "This is broken";

    return (
        <div className="place-self-center text-center">
            {defaultPlanet}
            {
                orbit.map(item => {
                    return <div>{item}</div>;
                })
            }
        </div>
    );
}

Planet.defaultProps = {
    defaultPlanet: <DefaultPlanet/>,
    animated : true,
    open: true,
    remainPlanets: true
};


function DefaultPlanet () {
    return <div className="btn-circle bg-pink-300">

    </div>
}
export default Planet;
