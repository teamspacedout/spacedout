import React from 'react';
import {motion} from "framer-motion";
import {FaHourglassStart} from "react-icons/fa";

function PlanetButton(props, {reactIcon}) {
    return (
        <div style={props.futureStyle} >
            <motion.button
                className="absolute btn-circle bg-white grid place-items-center"
                whileHover={{
                    scale: 1.2,
                    transition: { duration: 1 },
                }}
                whileTap={{ scale: 0.9 }}
            >
                <FaHourglassStart className="scale-150 text-purple-500"/>
            </motion.button>

        </div>
    );
}

export default PlanetButton;
