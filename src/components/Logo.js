import React from 'react';

function Logo({size}) {

    switch(size){
        case "small":
            return (
                <div>
                    <img className="image-full" src="/assests/logo/logo-s.png"/>
                </div>            );
        case "medium":
            return (
                <div>
                    <img className="image-full" src="/assests/logo/logo-m.png"/>
                </div>            );
        case "large":
            return (
                <div>
                    <img className="image-full" src="/assests/logo/logo-l.png"/>
                </div>            );
        default:
            return <p> You failed to pick a correct size</p>
    }

}

export default Logo;
