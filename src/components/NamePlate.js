import React from 'react';


function NamePlate({name, plateColor, textColor}) {
    return (
     <h1
        style={{
        backgroundColor:plateColor,
        borderColor: textColor,
        color:textColor,
        }}

        className="btn "
     >
         <div className="badge badge-lg badge-ghost badge-secondary">{name}</div>
    </h1>
    );
}

NamePlate.defaultProps = {
    name: 'Spaced Out Prime',
    plateColor: 'black',
    textColor: 'white'



}
export default NamePlate;
