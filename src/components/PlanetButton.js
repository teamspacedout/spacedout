import React from 'react';
import {AnimatePresence, motion} from "framer-motion";
import {FaHourglassStart} from "react-icons/fa";
import {Link} from "react-router-dom";


/*
       How to use:

       When you create the component in another class,
       You have 6 options of props:

       reactIcon: Use a react Icon for the inner look of the button/globe
       btnProperties: change styling of button, accepts a tring
       toolTip: Edit tooltip text, accepts a string
       hasToolTip: true or false for showing tooltip on hover
       Link: Add a link to the button for re-use



       Example:

        Basic Button:
        <PlanetButton Link = "/dog"/>

        Advanced Button
       <PlanetButton futureStyle = {{}}
 */
function PlanetButton(props) {
    return (
        <label htmlFor={props.html} className={props.hasToolTip ? "tooltip tooltip-secondary" : ""} data-tip ={`${props.toolTip}`} >
           <AnimatePresence>
               {
                   <motion.button
                initial={{scale: 0}}
                animate={{scale: props.scale}}
                transition={{duration: 0.75}}
                exit={{ scale: 0 }}
                className= {props.btnProperties}
                whileHover={{
                    scale: props.scale + (props.scale/2),
                    transition: { duration: 1 },
                }}
                whileTap={{ scale: 0.9 }}
            >
                <Link to={`${props.Link}`}>
                    {props.reactIcon}
                </Link>

            </motion.button>
               }
           </AnimatePresence>
        </label>
    );
}

PlanetButton.defaultProps = {
    btnProperties: "btn-circle bg-white grid place-items-center",
    reactIcon: <FaHourglassStart className="text-purple-800 scale-150"/>,
    toolTip: "Home",
    Link: "/",
    hasToolTip: true,
    isVisible: true,
    scale: 1,
    html: ""
}
export default PlanetButton;
