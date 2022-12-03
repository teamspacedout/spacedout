import React from 'react';


function NamePlate({name, plateColor, textColor}) {
    return (
     <h1 
        style={{
        backgroundColor:plateColor,
        padding:'20px',
        borderRadius:'25%',
        border: '1px solid',
        borderColor: textColor,
        color:textColor,
        textShadow: '2px 2px 18px' + textColor,
        textAlign: 'center',
        
        }}
     >
        {name}
    </h1>
    );
}

NamePlate.defaultProps = {
    name: 'Spaced Out Prime',
    plateColor: 'black',
    textColor: 'white'

  
    
}
export default NamePlate;