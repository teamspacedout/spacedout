import React, {useState} from 'react';
import {motion} from "framer-motion";
import AnimatedText from "./AnimatedText";



function FadingText({heading, subheading}) {
    const [replay, setReplay] = useState(true);
    const placeholderText = [
        { type: "heading1", text: `${heading}` },
        {
            type: "heading2",
            text: subheading ? `${subheading}` : ' '
        }
    ];

    const container = {
        visible: {
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    // Quick and dirt for the example
    const handleReplay = () => {
        setReplay(!replay);
        setTimeout(() => {
            setReplay(true);
        }, 600);
    };
    return (
        <motion.div
            className=""
            initial="hidden"
            // animate="visible"
            animate={replay ? "visible" : "hidden"}
            variants={container}
        >
            <div className=" font-space text-center text-3xl">
                {placeholderText.map((item, index) => {
                    return <AnimatedText {...item} key={index} />;
                })}
            </div>
        </motion.div>)
}

export default FadingText;