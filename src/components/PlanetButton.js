import React from 'react';
import {motion} from "framer-motion";

function PlanetButton(props) {
    return (
        <div style={props.futureStyle} className="absolute btn-circle bg-white">
            <motion.div/>


        </div>
    );
}

export default PlanetButton;
