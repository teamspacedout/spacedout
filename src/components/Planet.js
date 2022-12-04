import React from 'react';

/*
    For now, scale and image are only attributes

    scale: takes in a number, scales image

    Acceptable Vales: 50, 75, 100, 150, 250

    img: Simply put the link to the image and it will encompass a circle around the planet.
 */

function Planet({scale, img}) {
    return (
     <div style={{scale: `${scale}`}} className={`image-full scale-250 btn-circle shadow-md shadow-purple-200`}>
        <img src={`${img}`}/>
    </div>
    );
}

Planet.defaultProps = {
    scale: "100%",
    img: "/assests/planets/Earth/4.png"
}
export default Planet;
